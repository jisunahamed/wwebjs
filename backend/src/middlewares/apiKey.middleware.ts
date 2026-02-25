import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { hashApiKey } from '../utils/crypto';

export const apiKeyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rawKey = req.headers['x-api-key'] as string;
        if (!rawKey) {
            throw new AppError('API key required. Provide x-api-key header.', 401);
        }

        const hashedKey = hashApiKey(rawKey);
        const apiKey = await prisma.apiKey.findUnique({
            where: { key: hashedKey },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        plan: true,
                        maxSessions: true,
                        isActive: true,
                    },
                },
            },
        });

        if (!apiKey || !apiKey.isActive) {
            throw new AppError('Invalid API key', 401);
        }

        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            throw new AppError('API key has expired', 401);
        }

        if (!apiKey.user.isActive) {
            throw new AppError('Account is deactivated', 403);
        }

        // Update last used (fire-and-forget)
        prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() },
        }).catch(() => { });

        req.user = apiKey.user;
        next();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError('API key validation failed', 401));
    }
};
