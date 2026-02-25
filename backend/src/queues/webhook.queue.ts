import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export const webhookQueue = new Queue('webhooks', {
    connection: redis,
    defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 2000 },
    },
});
