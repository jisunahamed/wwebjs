import { Queue } from 'bullmq';
import { redis } from '../config/redis';
import { logger } from '../config/logger';

let sessionQueue: Queue | null = null;

if (redis) {
    try {
        sessionQueue = new Queue('sessions', {
            connection: redis,
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: { count: 200 },
                removeOnFail: { count: 500 },
            },
        });
    } catch (err) {
        logger.warn('Session queue initialization failed');
    }
}

export { sessionQueue };
