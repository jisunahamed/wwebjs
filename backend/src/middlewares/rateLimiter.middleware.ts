import rateLimit from 'express-rate-limit';
import { config } from '../config';

const planLimits: Record<string, number> = {
    FREE: 60,
    STARTER: 300,
    PRO: 1000,
    ENTERPRISE: 5000,
};

export const apiRateLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: (req) => {
        const plan = (req as any).user?.plan || 'FREE';
        return planLimits[plan] || 60;
    },
    keyGenerator: (req) => (req as any).user?.id || req.ip || 'anonymous',
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests. Please try again later.',
    },
});

// Stricter limiter for auth endpoints
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    keyGenerator: (req) => req.ip || 'anonymous',
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many authentication attempts. Try again in 15 minutes.',
    },
});
