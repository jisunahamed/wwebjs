import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { sessionManager } from '../modules/session/sessionManager';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { webhookQueue } from '../queues/webhook.queue';
import { SettingsService } from '../modules/settings/settings.service';
import { randomBetween, sleep } from '../utils/crypto';

const settingsService = new SettingsService();

interface MessageJob {
    messageId: string;
    sessionId: string;
    userId: string;
    to: string;
    body: string;
    type: string;
    mediaUrl?: string;
}

async function applyAntiBlockDelays(userId: string, client: any, chatId: string) {
    const { settings } = await settingsService.getSettings(userId);

    // 1. Simulate online presence
    if (settings.onlinePresence) {
        try {
            await client.sendPresenceAvailable();
        } catch { }
    }

    // 2. Simulate typing
    if (settings.typingDelay) {
        try {
            const chat = await client.getChatById(chatId);
            await chat.sendStateTyping();
            await sleep(settings.typingDurationMs);
            await chat.clearState();
        } catch { }
    }

    // 3. Random delay between min and max
    const delay = randomBetween(settings.minDelayBetweenMsgs, settings.maxDelayBetweenMsgs);
    await sleep(delay);
}

const messageWorker = new Worker<MessageJob>(
    'messages',
    async (job: Job<MessageJob>) => {
        const { messageId, sessionId, to, body, userId } = job.data;

        await prisma.message.update({
            where: { id: messageId },
            data: { status: 'PROCESSING' },
        });

        const client = sessionManager.getClient(sessionId);
        if (!client) {
            throw new Error(`Session ${sessionId} not found or disconnected`);
        }

        const chatId = to.includes('@c.us') ? to : `${to}@c.us`;

        // Apply anti-block delays
        await applyAntiBlockDelays(userId, client, chatId);

        const result = await client.sendMessage(chatId, body);

        await prisma.message.update({
            where: { id: messageId },
            data: { status: 'SENT', externalId: (result as any).id?._serialized },
        });

        await webhookQueue.add('message.sent', {
            userId,
            event: 'message.sent',
            data: {
                messageId,
                to,
                status: 'SENT',
                externalId: (result as any).id?._serialized,
            },
        });

        logger.info(`Message ${messageId} sent to ${to}`);
        return { success: true };
    },
    {
        connection: redis,
        concurrency: 5,
        limiter: { max: 30, duration: 60000 },
    }
);

messageWorker.on('failed', async (job, err) => {
    if (job) {
        await prisma.message.update({
            where: { id: job.data.messageId },
            data: { status: 'FAILED', errorMessage: err.message },
        }).catch(() => { });

        await webhookQueue.add('message.failed', {
            userId: job.data.userId,
            event: 'message.failed',
            data: {
                messageId: job.data.messageId,
                to: job.data.to,
                error: err.message,
            },
        }).catch(() => { });

        logger.error(`Message ${job.data.messageId} failed: ${err.message}`);
    }
});

messageWorker.on('completed', (job) => {
    logger.debug(`Message job ${job.id} completed`);
});

export { messageWorker };
