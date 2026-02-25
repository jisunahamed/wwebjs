import { prisma } from '../../config/database';
import { AppError } from '../../utils/errors';
import { sessionManager } from './sessionManager';
import { messageQueue } from '../../queues/message.queue';
import { logger } from '../../config/logger';

export class SessionService {
    async create(userId: string, name: string) {
        // Check session limit
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { maxSessions: true },
        });

        const activeCount = await prisma.session.count({
            where: {
                userId,
                status: { in: ['INITIALIZING', 'QR_READY', 'CONNECTED'] },
            },
        });

        if (activeCount >= (user?.maxSessions || 2)) {
            throw new AppError(
                `Session limit reached. Your plan allows ${user?.maxSessions || 2} active sessions.`,
                429
            );
        }

        const session = await prisma.session.create({
            data: { userId, name },
            select: {
                id: true,
                name: true,
                status: true,
                createdAt: true,
            },
        });

        // Start WhatsApp session in background
        sessionManager.createSession(session.id, userId).catch((err) => {
            logger.error(`Failed to create WA session ${session.id}:`, err);
        });

        return session;
    }

    async listByUser(userId: string) {
        return prisma.session.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                phone: true,
                status: true,
                retryCount: true,
                lastActive: true,
                errorMessage: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { messages: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getById(userId: string, sessionId: string) {
        const session = await prisma.session.findFirst({
            where: { id: sessionId, userId },
            select: {
                id: true,
                name: true,
                phone: true,
                status: true,
                qrCode: true,
                retryCount: true,
                lastActive: true,
                errorMessage: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { messages: true } },
            },
        });

        if (!session) {
            throw new AppError('Session not found', 404);
        }

        return session;
    }

    async getQrCode(userId: string, sessionId: string) {
        const session = await prisma.session.findFirst({
            where: { id: sessionId, userId },
            select: { id: true, status: true, qrCode: true },
        });

        if (!session) {
            throw new AppError('Session not found', 404);
        }

        if (session.status !== 'QR_READY' || !session.qrCode) {
            return { status: session.status, qrCode: null };
        }

        return { status: session.status, qrCode: session.qrCode };
    }

    async delete(userId: string, sessionId: string) {
        const session = await prisma.session.findFirst({
            where: { id: sessionId, userId },
        });

        if (!session) {
            throw new AppError('Session not found', 404);
        }

        await sessionManager.destroySession(sessionId);
        await prisma.session.delete({ where: { id: sessionId } });

        return { deleted: true };
    }

    async reconnect(userId: string, sessionId: string) {
        const session = await prisma.session.findFirst({
            where: { id: sessionId, userId },
        });

        if (!session) {
            throw new AppError('Session not found', 404);
        }

        await sessionManager.reconnectSession(sessionId, userId);

        return { message: 'Reconnect initiated' };
    }

    async sendMessage(
        userId: string,
        sessionId: string,
        to: string,
        body: string,
        type: string = 'TEXT',
        mediaUrl?: string
    ) {
        const session = await prisma.session.findFirst({
            where: { id: sessionId, userId },
        });

        if (!session) {
            throw new AppError('Session not found', 404);
        }

        if (session.status !== 'CONNECTED') {
            throw new AppError(`Session is not connected. Current status: ${session.status}`, 400);
        }

        // Create message record
        const message = await prisma.message.create({
            data: {
                sessionId,
                to,
                body,
                type: type as any,
                mediaUrl,
                status: 'QUEUED',
            },
            select: {
                id: true,
                to: true,
                body: true,
                type: true,
                status: true,
                createdAt: true,
            },
        });

        // Add to queue
        await messageQueue.add('send-message', {
            messageId: message.id,
            sessionId,
            userId,
            to,
            body,
            type,
            mediaUrl,
        });

        return message;
    }

    async getSessionStatus(userId: string, sessionId: string) {
        const session = await prisma.session.findFirst({
            where: { id: sessionId, userId },
            select: {
                id: true,
                name: true,
                status: true,
                phone: true,
                lastActive: true,
            },
        });

        if (!session) {
            throw new AppError('Session not found', 404);
        }

        return {
            ...session,
            isInMemory: sessionManager.isSessionActive(sessionId),
        };
    }
}
