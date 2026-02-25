import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { signWebhookPayload } from '../../utils/crypto';
import axios from 'axios';

export interface WebhookJob {
    userId: string;
    event: string;
    data: Record<string, any>;
    sessionId?: string;
}

/**
 * Deliver a webhook event directly (without queue).
 * Used as fallback when Redis/BullMQ is unavailable.
 */
export async function deliverWebhook(jobData: WebhookJob): Promise<void> {
    const { userId, event, data } = jobData;

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
        }
    });

    await Promise.allSettled(deliveryPromises);
}
