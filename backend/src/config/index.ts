import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '4000'),
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    databaseUrl: process.env.DATABASE_URL!,

    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

    // JWT
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

    // Rate Limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),

    // WhatsApp
    waSessionPath: process.env.WA_SESSION_PATH || './wa-sessions',

    // WhatsApp Anti-Block Defaults
    waDefaults: {
        minDelay: parseInt(process.env.WA_DEFAULT_MIN_DELAY || '3000'),
        maxDelay: parseInt(process.env.WA_DEFAULT_MAX_DELAY || '7000'),
        maxMsgPerMin: parseInt(process.env.WA_DEFAULT_MAX_MSG_PER_MIN || '12'),
        maxMsgPerHour: parseInt(process.env.WA_DEFAULT_MAX_MSG_PER_HOUR || '200'),
        maxMsgPerDay: parseInt(process.env.WA_DEFAULT_MAX_MSG_PER_DAY || '1000'),
        maxNewChatsPerDay: parseInt(process.env.WA_DEFAULT_MAX_NEW_CHATS_PER_DAY || '50'),
    },

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
