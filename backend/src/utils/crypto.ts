import crypto from 'crypto';

export function generateApiKey(): string {
    return `wpk_${crypto.randomBytes(32).toString('hex')}`;
}

export function hashApiKey(rawKey: string): string {
    return crypto.createHash('sha256').update(rawKey).digest('hex');
}

export function generateWebhookSecret(): string {
    return crypto.randomBytes(32).toString('hex');
}

export function signWebhookPayload(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
