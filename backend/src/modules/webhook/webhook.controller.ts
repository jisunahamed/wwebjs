import { Request, Response, NextFunction } from 'express';
import { WebhookService } from './webhook.service';
import { ApiResponse } from '../../utils/apiResponse';

const webhookService = new WebhookService();

export class WebhookController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { url, events } = req.body;
            const result = await webhookService.create(req.user!.id, url, events);
            ApiResponse.created(res, result, 'Webhook created. Save the secret for signature verification.');
        } catch (error) {
            next(error);
        }
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const webhooks = await webhookService.listByUser(req.user!.id);
            ApiResponse.success(res, webhooks);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const webhook = await webhookService.getById(req.user!.id, req.params.id);
            ApiResponse.success(res, webhook);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await webhookService.update(req.user!.id, req.params.id, req.body);
            ApiResponse.success(res, result, 200, 'Webhook updated');
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await webhookService.delete(req.user!.id, req.params.id);
            ApiResponse.success(res, result, 200, 'Webhook deleted');
        } catch (error) {
            next(error);
        }
    }

    async regenerateSecret(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await webhookService.regenerateSecret(req.user!.id, req.params.id);
            ApiResponse.success(res, result, 200, 'Webhook secret regenerated');
        } catch (error) {
            next(error);
        }
    }
}
