import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export const messageQueue = new Queue('messages', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
    },
});
