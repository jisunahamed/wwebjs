import { Client, LocalAuth } from 'whatsapp-web.js';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { logger } from '../../config/logger';
import { webhookQueue } from '../../queues/webhook.queue';
import { deliverWebhook } from '../webhook/webhook.delivery';
import { EventEmitter } from 'events';

// Helper: use queue if Redis available, otherwise deliver directly
async function emitWebhook(jobName: string, data: any) {
    try {
        if (webhookQueue) {
            await webhookQueue.add(jobName, data);
        } else {
            // Direct delivery fallback (no Redis)
            await deliverWebhook(data);
        }
    } catch (err) {
        logger.debug(`Webhook emit failed for ${jobName}, trying direct delivery`);
        try { await deliverWebhook(data); } catch { }
    }
}

class SessionManager extends EventEmitter {
    private clients: Map<string, Client> = new Map();

    async createSession(sessionId: string, userId: string): Promise<void> {
        if (this.clients.has(sessionId)) {
            logger.warn(`Session ${sessionId} already exists in memory`);
            return;
        }

        const puppeteerArgs = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-first-run',
            '--disable-extensions',
        ];

        // On Linux (Docker), add more restrictive args
        if (process.platform === 'linux') {
            puppeteerArgs.push('--no-zygote', '--single-process');
        }

        const client = new Client({
            authStrategy: new LocalAuth({
                clientId: sessionId,
                dataPath: config.waSessionPath,
            }),
            puppeteer: {
                headless: true,
                args: puppeteerArgs,
                // Use system Chrome on Windows if PUPPETEER_EXECUTABLE_PATH not set
                ...(process.env.PUPPETEER_EXECUTABLE_PATH
                    ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH }
                    : {}),
            },
        });

        this.setupEventListeners(client, sessionId, userId);
        this.clients.set(sessionId, client);

        try {
            await client.initialize();
            logger.info(`Session ${sessionId} initialization started`);
        } catch (error: any) {
            logger.error(`Session ${sessionId} init failed: ${error.message}`);
            this.clients.delete(sessionId);
            await prisma.session.update({
                where: { id: sessionId },
                data: { status: 'FAILED', errorMessage: error.message },
            });
        }
    }

    private setupEventListeners(client: Client, sessionId: string, userId: string) {
        client.on('qr', async (qr: string) => {
            try {
                await prisma.session.update({
                    where: { id: sessionId },
                    data: { status: 'QR_READY', qrCode: qr },
                });
                this.emit('qr', { sessionId, qr });
                logger.info(`QR generated for session ${sessionId}`);
            } catch (err) {
                logger.error(`Failed to update QR for session ${sessionId}`, err);
            }
        });

        client.on('ready', async () => {
            try {
                const info = client.info;
                await prisma.session.update({
                    where: { id: sessionId },
                    data: {
                        status: 'CONNECTED',
                        phone: info?.wid?.user || null,
                        qrCode: null,
                        lastActive: new Date(),
                        retryCount: 0,
                    },
                });
                this.emit('ready', { sessionId });

                await emitWebhook('session.connected', {
                    userId,
                    sessionId,
                    event: 'session.connected',
                    data: { phone: info?.wid?.user },
                });

                logger.info(`Session ${sessionId} connected: ${info?.wid?.user}`);
            } catch (err) {
                logger.error(`Failed to handle ready for session ${sessionId}`, err);
            }
        });

        client.on('disconnected', async (reason: string) => {
            try {
                await prisma.session.update({
                    where: { id: sessionId },
                    data: { status: 'DISCONNECTED', errorMessage: reason },
                });
                this.clients.delete(sessionId);
                this.emit('disconnected', { sessionId, reason });

                await emitWebhook('session.disconnected', {
                    userId,
                    sessionId,
                    event: 'session.disconnected',
                    data: { reason },
                });

                logger.warn(`Session ${sessionId} disconnected: ${reason}`);

                // Auto-reconnect if enabled
                const settings = await prisma.userSettings.findUnique({
                    where: { userId },
                });
                if (settings?.autoReconnect) {
                    logger.info(`Auto-reconnect triggered for session ${sessionId}`);
                    setTimeout(() => {
                        this.reconnectSession(sessionId, userId).catch((err) =>
                            logger.error(`Auto-reconnect failed for ${sessionId}`, err)
                        );
                    }, 5000);
                }
            } catch (err) {
                logger.error(`Failed to handle disconnect for session ${sessionId}`, err);
            }
        });

        client.on('message', async (msg) => {
            try {
                logger.info(`📩 Incoming message on session ${sessionId} from ${msg.from}: ${msg.body?.substring(0, 50)}`);

                // Map whatsapp-web.js type to our MessageType enum
                const typeMap: Record<string, string> = {
                    chat: 'CHAT', text: 'TEXT', image: 'IMAGE',
                    video: 'VIDEO', audio: 'AUDIO', document: 'DOCUMENT',
                };
                const msgType = typeMap[msg.type] || 'CHAT';

                // Store incoming message in DB
                await prisma.message.create({
                    data: {
                        sessionId,
                        userId,
                        to: msg.to || sessionId,
                        body: msg.body || '',
                        type: msgType as any,
                        status: 'RECEIVED' as any,
                        direction: 'INBOUND' as any,
                        externalId: (msg as any).id?._serialized || null,
                    },
                });

                await prisma.session.update({
                    where: { id: sessionId },
                    data: { lastActive: new Date() },
                });

                logger.info(`📩 Message stored, now emitting webhook for session ${sessionId}`);

                await emitWebhook('message.received', {
                    userId,
                    sessionId,
                    event: 'message.received',
                    data: {
                        from: msg.from,
                        body: msg.body,
                        type: msg.type,
                        timestamp: msg.timestamp,
                        hasMedia: msg.hasMedia,
                    },
                });

                logger.info(`✅ Webhook emitted for incoming message on session ${sessionId}`);
            } catch (err) {
                logger.error(`Failed to handle message for session ${sessionId}`, err);
            }
        });

        client.on('auth_failure', async (error: string) => {
            try {
                await prisma.session.update({
                    where: { id: sessionId },
                    data: { status: 'FAILED', errorMessage: `Auth failure: ${error}` },
                });
                this.clients.delete(sessionId);
                logger.error(`Session ${sessionId} auth failure: ${error}`);
            } catch (err) {
                logger.error(`Failed to handle auth failure for session ${sessionId}`, err);
            }
        });
    }

    getClient(sessionId: string): Client | undefined {
        return this.clients.get(sessionId);
    }

    isSessionActive(sessionId: string): boolean {
        return this.clients.has(sessionId);
    }

    async destroySession(sessionId: string): Promise<void> {
        const client = this.clients.get(sessionId);
        if (client) {
            try {
                await client.destroy();
            } catch (err) {
                logger.error(`Error destroying client for session ${sessionId}`, err);
            }
            this.clients.delete(sessionId);
        }

        await prisma.session.update({
            where: { id: sessionId },
            data: { status: 'TERMINATED', qrCode: null },
        });

        logger.info(`Session ${sessionId} destroyed`);
    }

    async reconnectSession(sessionId: string, userId: string): Promise<void> {
        const session = await prisma.session.findUnique({ where: { id: sessionId } });
        if (!session) return;

        const settings = await prisma.userSettings.findUnique({ where: { userId } });
        const maxRetries = settings?.maxReconnectAttempts || 5;

        if (session.retryCount >= maxRetries) {
            await prisma.session.update({
                where: { id: sessionId },
                data: { status: 'FAILED', errorMessage: `Max retries (${maxRetries}) exceeded` },
            });
            logger.warn(`Session ${sessionId} max retries exceeded`);
            return;
        }

        // Destroy existing client if any
        if (this.clients.has(sessionId)) {
            const client = this.clients.get(sessionId);
            try {
                await client?.destroy();
            } catch { }
            this.clients.delete(sessionId);
        }

        await prisma.session.update({
            where: { id: sessionId },
            data: { retryCount: { increment: 1 }, status: 'INITIALIZING' },
        });

        await this.createSession(sessionId, userId);
    }

    getActiveSessions(): string[] {
        return Array.from(this.clients.keys());
    }

    getActiveSessionCount(): number {
        return this.clients.size;
    }

    async initialize(): Promise<void> {
        logger.info('Initializing all active WhatsApp sessions...');
        const sessions = await prisma.session.findMany({
            where: {
                status: { in: ['CONNECTED', 'QR_READY', 'INITIALIZING'] }
            }
        });

        logger.info(`Found ${sessions.length} sessions to restore`);

        for (const session of sessions) {
            try {
                // Don't await here, initialize in background
                this.createSession(session.id, session.userId).catch(err => {
                    logger.error(`Failed to restore session ${session.id}:`, err);
                });
            } catch (err) {
                logger.error(`Error triggering restoration for session ${session.id}:`, err);
            }
        }
    }
}

export const sessionManager = new SessionManager();
