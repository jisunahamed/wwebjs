import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { sessionManager } from '../modules/session/sessionManager';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

interface SessionJob {
    sessionId: string;
    userId: string;
    action: 'init' | 'reconnect' | 'destroy';
}

if (redis) {
    const sessionWorker = new Worker<SessionJob>(
        'sessions',
        async (job: Job<SessionJob>) => {
            const { sessionId, userId, action } = job.data;

            switch (action) {
                case 'init':
                    logger.info(`Worker: Initializing session ${sessionId}`);
                    await sessionManager.createSession(sessionId, userId);
                    break;

                case 'reconnect':
                    logger.info(`Worker: Reconnecting session ${sessionId}`);
                    await sessionManager.reconnectSession(sessionId, userId);
                    break;

                case 'destroy':
                    logger.info(`Worker: Destroying session ${sessionId}`);
                    await sessionManager.destroySession(sessionId);
                    break;

                default:
                    logger.warn(`Unknown session action: ${action}`);
            }
        },
        {
            connection: redis,
            concurrency: 2,
        }
    );

    sessionWorker.on('failed', async (job, err) => {
        if (job) {
            logger.error(`Session job ${job.id} failed: ${err.message}`);
            try {
                await prisma.session.update({
                    where: { id: job.data.sessionId },
                    data: { status: 'FAILED', errorMessage: err.message },
                });
            } catch { }
        }
    });

    logger.info('Session worker started');
} else {
    logger.warn('⚠️ Session worker disabled (no Redis)');
}
