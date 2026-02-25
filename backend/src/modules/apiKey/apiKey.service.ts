import { prisma } from '../../config/database';
import { AppError } from '../../utils/errors';
import { generateApiKey, hashApiKey } from '../../utils/crypto';

export class ApiKeyService {
    async create(userId: string, name: string, expiresAt?: string) {
        const rawKey = generateApiKey();
        const hashedKey = hashApiKey(rawKey);

        const apiKey = await prisma.apiKey.create({
            data: {
                key: hashedKey,
                name,
                userId,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
                expiresAt: true,
            },
        });

        // Return raw key only once — user must save it
        return { ...apiKey, key: rawKey };
    }

    async listByUser(userId: string) {
        return prisma.apiKey.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                isActive: true,
                lastUsedAt: true,
                createdAt: true,
                expiresAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async revoke(userId: string, keyId: string) {
        const key = await prisma.apiKey.findFirst({
            where: { id: keyId, userId },
        });

        if (!key) {
            throw new AppError('API key not found', 404);
        }

        return prisma.apiKey.update({
            where: { id: keyId },
            data: { isActive: false },
            select: {
                id: true,
                name: true,
                isActive: true,
            },
        });
    }

    async delete(userId: string, keyId: string) {
        const key = await prisma.apiKey.findFirst({
            where: { id: keyId, userId },
        });

        if (!key) {
            throw new AppError('API key not found', 404);
        }

        await prisma.apiKey.delete({ where: { id: keyId } });
        return { deleted: true };
    }
}
