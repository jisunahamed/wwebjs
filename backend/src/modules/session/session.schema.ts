import { z } from 'zod';

export const createSessionSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Session name is required').max(100),
    }),
});

export const sendMessageSchema = z.object({
    body: z.object({
        sessionId: z.string().uuid('Invalid session ID'),
        to: z.string().min(10, 'Phone number is required'),
        body: z.string().min(1, 'Message body is required'),
        type: z.enum(['TEXT', 'IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO']).optional().default('TEXT'),
        mediaUrl: z.string().url().optional(),
    }),
});
