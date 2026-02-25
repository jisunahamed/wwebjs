import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service';
import { ApiResponse } from '../../utils/apiResponse';

const settingsService = new SettingsService();

export class SettingsController {
    async get(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await settingsService.getSettings(req.user!.id);
            ApiResponse.success(res, result);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await settingsService.updateSettings(req.user!.id, req.body);
            if (!result.updated) {
                return res.status(400).json({
                    success: false,
                    warnings: result.warnings,
                    message: result.message,
                });
            }
            ApiResponse.success(res, result, 200, 'Settings updated');
        } catch (error) {
            next(error);
        }
    }

    async reset(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await settingsService.resetToDefaults(req.user!.id);
            ApiResponse.success(res, result, 200, 'Settings reset to recommended defaults');
        } catch (error) {
            next(error);
        }
    }

    async getDefaults(req: Request, res: Response, next: NextFunction) {
        try {
            const result = settingsService.getDefaults();
            ApiResponse.success(res, result);
        } catch (error) {
            next(error);
        }
    }
}
