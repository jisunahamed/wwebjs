import { Queue } from 'bullmq';
import { redis } from '../config/redis';
import { logger } from '../config/logger';

let webhookQueue: Queue | null = null;

if (redis) {
    try {
        webhookQueue = new Queue('webhooks', {
            connection: redis,
            defaultJobOptions: {
                attempts: 5,
                backoff: { type: 'exponential', delay: 3000 },
                removeOnComplete: { count: 500 },
                removeOnFail: { count: 2000 },
            },
        });
    } catch (err) {
        logger.warn('Webhook queue initialization failed');
    }
}

export { webhookQueue };
