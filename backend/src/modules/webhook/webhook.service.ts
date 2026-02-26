import { prisma } from '../../config/database';
import { AppError } from '../../utils/errors';
import { generateWebhookSecret } from '../../utils/crypto';

export class WebhookService {
    async create(userId: string, url: string, events: string[]) {
        const secret = generateWebhookSecret();

        const webhook = await prisma.webhook.create({
            data: { userId, url, events, secret },
            select: {
                id: true,
                url: true,
                events: true,
                secret: true,
                isActive: true,
                createdAt: true,
            },
        });

        return webhook;
    }

    async listByUser(userId: string) {
        return prisma.webhook.findMany({
            where: { userId },
            select: {
                id: true,
                url: true,
                events: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getById(userId: string, webhookId: string) {
        const webhook = await prisma.webhook.findFirst({
            where: { id: webhookId, userId },
            select: {
                id: true,
                url: true,
                events: true,
                secret: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!webhook) {
            throw new AppError('Webhook not found', 404);
        }

        return webhook;
    }

    async update(
        userId: string,
        webhookId: string,
        data: { url?: string; events?: string[]; isActive?: boolean }
    ) {
        const webhook = await prisma.webhook.findFirst({
            where: { id: webhookId, userId },
        });

        if (!webhook) {
            throw new AppError('Webhook not found', 404);
        }

        const updateData: any = {};
        if (data.url !== undefined) updateData.url = data.url;
        if (data.events !== undefined) updateData.events = data.events;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        return prisma.webhook.update({
            where: { id: webhookId },
            data: updateData,
            select: {
                id: true,
                url: true,
                events: true,
                isActive: true,
                updatedAt: true,
            },
        });
    }

    async delete(userId: string, webhookId: string) {
        const webhook = await prisma.webhook.findFirst({
            where: { id: webhookId, userId },
        });

        if (!webhook) {
            throw new AppError('Webhook not found', 404);
        }

        await prisma.webhook.delete({ where: { id: webhookId } });
        return { deleted: true };
    }

    async regenerateSecret(userId: string, webhookId: string) {
        const webhook = await prisma.webhook.findFirst({
            where: { id: webhookId, userId },
        });

        if (!webhook) {
            throw new AppError('Webhook not found', 404);
        }

        const newSecret = generateWebhookSecret();
        return prisma.webhook.update({
            where: { id: webhookId },
            data: { secret: newSecret },
            select: { id: true, secret: true },
        });
    }
}
