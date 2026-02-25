import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../config/logger';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
    }

    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        logger.error('Database error:', err);
        return res.status(400).json({
            success: false,
            error: 'Database operation failed',
        });
    }

    // Unexpected errors
    logger.error('Unhandled error:', err);
    return res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
};
