import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../utils/apiResponse';

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password, name } = req.body;
            const result = await authService.register(email, password, name);
            ApiResponse.created(res, result, result.message);
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            ApiResponse.success(res, result, 200, 'Login successful');
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const profile = await authService.getProfile(userId);
            ApiResponse.success(res, profile);
        } catch (error) {
            next(error);
        }
    }
}
