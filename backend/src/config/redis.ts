import Redis from 'ioredis';
import { config } from './index';
import { logger } from './logger';

let redis: any = null;
let redisAvailable = false;

function createRedisConnection(): any {
    try {
        const connection = new Redis(config.redisUrl, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            lazyConnect: true,
            retryStrategy(times: number) {
                if (times > 3) {
                    return null; // Stop retrying
                }
                return Math.min(times * 200, 2000);
            },
        });

        connection.on('connect', () => {
            redisAvailable = true;
            logger.info('✅ Redis connected');
        });

        connection.on('error', () => {
            // Silently ignore — we handle this via redisAvailable flag
        });

        connection.on('close', () => {
            redisAvailable = false;
        });

        // Try to connect — don't throw if it fails
        connection.connect().then(() => {
            redisAvailable = true;
        }).catch(() => {
            logger.warn('⚠️ Redis unavailable — queues/workers disabled. App will work for auth & admin.');
            redis = null;
        });

        return connection;
    } catch {
        logger.warn('⚠️ Redis initialization failed');
        return null;
    }
}

redis = createRedisConnection();

export { redis, redisAvailable };
