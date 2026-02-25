import { z } from 'zod';

export const listMessagesSchema = z.object({
    params: z.object({
        sessionId: z.string().uuid('Invalid session ID'),
    }),
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
        status: z.enum(['QUEUED', 'PROCESSING', 'SENT', 'DELIVERED', 'READ', 'FAILED']).optional(),
    }),
});
