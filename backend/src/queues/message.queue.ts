import { Queue } from 'bullmq';
import { redis } from '../config/redis';
import { logger } from '../config/logger';

let messageQueue: Queue | null = null;

if (redis) {
    try {
        messageQueue = new Queue('messages', {
            connection: redis,
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
                removeOnComplete: { count: 1000 },
                removeOnFail: { count: 5000 },
            },
        });
    } catch (err) {
        logger.warn('Message queue initialization failed');
    }
}

export { messageQueue };
