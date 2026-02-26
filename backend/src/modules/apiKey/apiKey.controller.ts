import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from './apiKey.service';
import { ApiResponse } from '../../utils/apiResponse';

const apiKeyService = new ApiKeyService();

export class ApiKeyController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, expiresAt } = req.body;
            const result = await apiKeyService.create(req.user!.id, name, expiresAt);
            ApiResponse.created(res, result, 'API key created. Save this key — it won\'t be shown again.');
        } catch (error) {
            next(error);
        }
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const keys = await apiKeyService.listByUser(req.user!.id);
            ApiResponse.success(res, keys);
        } catch (error) {
            next(error);
        }
    }

    async revoke(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await apiKeyService.revoke(req.user!.id, req.params.id as string);
            ApiResponse.success(res, result, 200, 'API key revoked');
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await apiKeyService.delete(req.user!.id, req.params.id as string);
            ApiResponse.success(res, result, 200, 'API key deleted');
        } catch (error) {
            next(error);
        }
    }
}
