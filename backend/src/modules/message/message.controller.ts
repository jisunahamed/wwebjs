import { Request, Response, NextFunction } from 'express';
import { MessageService } from './message.service';
import { ApiResponse } from '../../utils/apiResponse';

const messageService = new MessageService();

export class MessageController {
    async listBySession(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const status = req.query.status as string | undefined;

            const result = await messageService.listBySession(
                req.user!.id,
                sessionId,
                page,
                limit,
                status
            );

            ApiResponse.paginated(res, result.messages, result.total, result.page, result.limit);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const message = await messageService.getById(req.user!.id, req.params.id);
            ApiResponse.success(res, message);
        } catch (error) {
            next(error);
        }
    }

    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await messageService.getStats(req.user!.id);
            ApiResponse.success(res, stats);
        } catch (error) {
            next(error);
        }
    }
}
