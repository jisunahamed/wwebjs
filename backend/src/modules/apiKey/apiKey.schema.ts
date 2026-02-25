import { z } from 'zod';

export const createApiKeySchema = z.object({
    body: z.object({
        name: z.string().min(1, 'API key name is required').max(100),
        expiresAt: z.string().datetime().optional(),
    }),
});

export const revokeApiKeySchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid API key ID'),
    }),
});
