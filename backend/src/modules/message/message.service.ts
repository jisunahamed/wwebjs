import { prisma } from '../../config/database';
import { AppError } from '../../utils/errors';
import { MessageStatus } from '@prisma/client';

export class MessageService {
    async listBySession(
        userId: string,
        sessionId: string,
        page: number = 1,
        limit: number = 50,
        status?: string
    ) {
        // Verify session belongs to user
        const session = await prisma.session.findFirst({
            where: { id: sessionId, userId },
        });

        if (!session) {
            throw new AppError('Session not found', 404);
        }

        const where: any = { sessionId };
        if (status) {
            where.status = status as MessageStatus;
        }

        const [messages, total] = await Promise.all([
            prisma.message.findMany({
                where,
                select: {
                    id: true,
                    to: true,
                    body: true,
                    type: true,
                    status: true,
                    externalId: true,
                    errorMessage: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.message.count({ where }),
        ]);

        return { messages, total, page, limit };
    }

    async getById(userId: string, messageId: string) {
        const message = await prisma.message.findUnique({
            where: { id: messageId },
            include: {
                session: {
                    select: { userId: true, name: true },
                },
            },
        });

        if (!message || message.session.userId !== userId) {
            throw new AppError('Message not found', 404);
        }

        return message;
    }

    async getStats(userId: string) {
        const sessions = await prisma.session.findMany({
            where: { userId },
            select: { id: true },
        });

        const sessionIds = sessions.map((s) => s.id);

        const stats = await prisma.message.groupBy({
            by: ['status'],
            where: { sessionId: { in: sessionIds } },
            _count: { id: true },
        });

        const result: Record<string, number> = {};
        stats.forEach((s) => {
            result[s.status] = s._count.id;
        });

        return result;
    }
}
