import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { signWebhookPayload } from '../utils/crypto';
import axios from 'axios';

interface WebhookJob {
    userId: string;
    event: string;
    data: Record<string, any>;
    sessionId?: string;
}

if (redis) {
    const webhookWorker = new Worker<WebhookJob>(
        'webhooks',
        async (job: Job<WebhookJob>) => {
            const { userId, event, data } = job.data;

            const webhooks = await prisma.webhook.findMany({
                where: {
                    userId,
                    isActive: true,
                    events: { has: event },
                },
            });

            if (webhooks.length === 0) {
                logger.debug(`No active webhooks for event ${event}, user ${userId}`);
                return;
            }

            const deliveryPromises = webhooks.map(async (webhook) => {
                const payload = {
                    event,
                    data,
                    timestamp: new Date().toISOString(),
                };

                const payloadStr = JSON.stringify(payload);
                const signature = signWebhookPayload(payloadStr, webhook.secret);

                try {
                    await axios.post(webhook.url, payload, {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Webhook-Signature': signature,
                            'X-Webhook-Event': event,
                        },
                        timeout: 10000,
                    });
                    logger.info(`Webhook delivered: ${event} -> ${webhook.url}`);
                } catch (error: any) {
                    logger.error(`Webhook delivery failed: ${webhook.url} — ${error.message}`);
                    throw error;
                }
            });

            await Promise.allSettled(deliveryPromises);
        },
        {
            connection: redis,
            concurrency: 10,
        }
    );

    webhookWorker.on('failed', (job, err) => {
        logger.error(`Webhook job ${job?.id} failed: ${err.message}`);
    });

    logger.info('Webhook worker started');
} else {
    logger.warn('⚠️ Webhook worker disabled (no Redis) — using direct delivery');
}
