import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { ApiResponse } from '../../utils/apiResponse';

const adminService = new AdminService();

export class AdminController {
    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await adminService.getStats();
            ApiResponse.success(res, stats);
        } catch (error) { next(error); }
    }

    async listUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, search } = req.query as any;
            const users = await adminService.listUsers({ status, search });
            ApiResponse.success(res, users);
        } catch (error) { next(error); }
    }

    async approveUser(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminService.approveUser(req.params.id);
            ApiResponse.success(res, result, 200, 'User approved successfully');
        } catch (error) { next(error); }
    }

    async rejectUser(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminService.rejectUser(req.params.id);
            ApiResponse.success(res, result, 200, 'User rejected');
        } catch (error) { next(error); }
    }

    async toggleUserActive(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminService.toggleUserActive(req.params.id);
            ApiResponse.success(res, result);
        } catch (error) { next(error); }
    }

    async updateUserPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const { plan, maxSessions } = req.body;
            const result = await adminService.updateUserPlan(req.params.id, plan, maxSessions);
            ApiResponse.success(res, result, 200, 'Plan updated');
        } catch (error) { next(error); }
    }
}
