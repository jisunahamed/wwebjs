import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from '../utils/errors';
import { prisma } from '../config/database';
import { JwtPayload } from '../types';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Authentication required. Provide Bearer token.', 401);
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                plan: true,
                maxSessions: true,
                isActive: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 401);
        }

        if (!user.isActive) {
            throw new AppError('Account is deactivated', 403);
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError('Invalid or expired token', 401));
        }
        next(new AppError('Authentication failed', 401));
    }
};

// Admin-only middleware — must be used AFTER authMiddleware
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return next(new AppError('Admin access required', 403));
    }
    next();
};
