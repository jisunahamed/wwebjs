import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const userId = (req as any).user?.id;

        logger.info(`${req.method} ${req.originalUrl}`, {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userId: userId || 'anonymous',
        });

        // Log to database (fire-and-forget) — only for authenticated requests
        if (userId) {
            prisma.usageLog.create({
                data: {
                    userId,
                    endpoint: req.originalUrl,
                    method: req.method,
                    statusCode: res.statusCode,
                    responseTime: duration,
                    ip: req.ip || null,
                },
            }).catch(() => { });
        }
    });

    next();
};
