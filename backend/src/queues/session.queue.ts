import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export const sessionQueue = new Queue('sessions', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 200 },
        removeOnFail: { count: 500 },
    },
});
