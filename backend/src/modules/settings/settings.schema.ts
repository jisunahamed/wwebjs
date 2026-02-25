import { z } from 'zod';

export const updateSettingsSchema = z.object({
    body: z.object({
        minDelayBetweenMsgs: z.number().int().min(500).max(30000).optional(),
        maxDelayBetweenMsgs: z.number().int().min(1000).max(60000).optional(),
        maxMsgsPerMinute: z.number().int().min(1).max(100).optional(),
        maxMsgsPerHour: z.number().int().min(10).max(2000).optional(),
        maxMsgsPerDay: z.number().int().min(50).max(10000).optional(),
        typingDelay: z.boolean().optional(),
        typingDurationMs: z.number().int().min(500).max(10000).optional(),
        onlinePresence: z.boolean().optional(),
        readReceipts: z.boolean().optional(),
        maxNewChatsPerDay: z.number().int().min(5).max(500).optional(),
        cooldownAfterBurst: z.number().int().min(0).max(120000).optional(),
        burstThreshold: z.number().int().min(3).max(50).optional(),
        autoReconnect: z.boolean().optional(),
        maxReconnectAttempts: z.number().int().min(1).max(20).optional(),
        riskAcknowledged: z.boolean().optional(),
    }),
});
