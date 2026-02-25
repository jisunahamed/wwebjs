import { prisma } from '../../config/database';
import { logger } from '../../config/logger';

const RECOMMENDED_DEFAULTS = {
    minDelayBetweenMsgs: 3000,
    maxDelayBetweenMsgs: 7000,
    maxMsgsPerMinute: 12,
    maxMsgsPerHour: 200,
    maxMsgsPerDay: 1000,
    typingDelay: true,
    typingDurationMs: 2000,
    onlinePresence: true,
    readReceipts: true,
    maxNewChatsPerDay: 50,
    cooldownAfterBurst: 30000,
    burstThreshold: 10,
    autoReconnect: true,
    maxReconnectAttempts: 5,
};

const RISK_THRESHOLDS: Record<string, { min?: number; max?: number; warn: string }> = {
    minDelayBetweenMsgs: { min: 1000, warn: 'Delay below 1s greatly increases ban risk' },
    maxMsgsPerMinute: { max: 30, warn: 'More than 30 msgs/min is very risky' },
    maxMsgsPerHour: { max: 500, warn: 'Over 500 msgs/hour may trigger ban' },
    maxMsgsPerDay: { max: 3000, warn: 'Over 3000 msgs/day is unsafe' },
    maxNewChatsPerDay: { max: 100, warn: 'Over 100 new chats/day flags as spam' },
};

export class SettingsService {
    async getSettings(userId: string) {
        let settings = await prisma.userSettings.findUnique({ where: { userId } });
        if (!settings) {
            settings = await prisma.userSettings.create({
                data: { userId, ...RECOMMENDED_DEFAULTS },
            });
        }
        return { settings, defaults: RECOMMENDED_DEFAULTS };
    }

    async updateSettings(userId: string, updates: Record<string, any>) {
        const warnings: string[] = [];

        // Check each update against risk thresholds
        for (const [key, value] of Object.entries(updates)) {
            if (key === 'riskAcknowledged') continue;
            const threshold = RISK_THRESHOLDS[key];
            if (threshold && typeof value === 'number') {
                if (threshold.min !== undefined && value < threshold.min) {
                    warnings.push(threshold.warn);
                }
                if (threshold.max !== undefined && value > threshold.max) {
                    warnings.push(threshold.warn);
                }
            }
        }

        // If there are warnings and user hasn't acknowledged risk, return warnings
        if (warnings.length > 0 && !updates.riskAcknowledged) {
            return {
                updated: false,
                warnings,
                message: 'These settings increase your ban risk. Set riskAcknowledged=true to confirm.',
            };
        }

        const { riskAcknowledged, ...settingUpdates } = updates;

        const settings = await prisma.userSettings.upsert({
            where: { userId },
            update: { ...settingUpdates, riskAcknowledged: warnings.length > 0 },
            create: { userId, ...RECOMMENDED_DEFAULTS, ...settingUpdates },
        });

        if (warnings.length > 0) {
            logger.warn(`User ${userId} set risky WA settings: ${warnings.join(', ')}`);
        }

        return { updated: true, settings, warnings };
    }

    async resetToDefaults(userId: string) {
        const settings = await prisma.userSettings.upsert({
            where: { userId },
            update: { ...RECOMMENDED_DEFAULTS, riskAcknowledged: false },
            create: { userId, ...RECOMMENDED_DEFAULTS },
        });

        return { settings, defaults: RECOMMENDED_DEFAULTS };
    }

    getDefaults() {
        return { defaults: RECOMMENDED_DEFAULTS, riskThresholds: RISK_THRESHOLDS };
    }
}
