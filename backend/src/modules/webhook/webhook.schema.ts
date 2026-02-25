import { z } from 'zod';

export const createWebhookSchema = z.object({
    body: z.object({
        url: z.string().url('Invalid webhook URL'),
        events: z.array(
            z.enum([
                'message.received',
                'message.sent',
                'message.failed',
                'session.connected',
                'session.disconnected',
                'session.qr',
            ])
        ).min(1, 'At least one event is required'),
    }),
});

export const updateWebhookSchema = z.object({
    body: z.object({
        url: z.string().url('Invalid URL').optional(),
        events: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
    }),
});
