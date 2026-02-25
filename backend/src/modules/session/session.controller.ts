import { Request, Response, NextFunction } from 'express';
import { SessionService } from './session.service';
import { ApiResponse } from '../../utils/apiResponse';

const sessionService = new SessionService();

export class SessionController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await sessionService.create(req.user!.id, req.body.name);
            ApiResponse.created(res, result, 'Session created. Waiting for QR code...');
        } catch (error) {
            next(error);
        }
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const sessions = await sessionService.listByUser(req.user!.id);
            ApiResponse.success(res, sessions);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const session = await sessionService.getById(req.user!.id, req.params.id);
            ApiResponse.success(res, session);
        } catch (error) {
            next(error);
        }
    }

    async getQrCode(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await sessionService.getQrCode(req.user!.id, req.params.id);
            ApiResponse.success(res, result);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await sessionService.delete(req.user!.id, req.params.id);
            ApiResponse.success(res, result, 200, 'Session deleted');
        } catch (error) {
            next(error);
        }
    }

    async reconnect(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await sessionService.reconnect(req.user!.id, req.params.id);
            ApiResponse.success(res, result);
        } catch (error) {
            next(error);
        }
    }

    async sendMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId, to, body, type, mediaUrl } = req.body;
            const result = await sessionService.sendMessage(
                req.user!.id,
                sessionId,
                to,
                body,
                type,
                mediaUrl
            );
            ApiResponse.created(res, result, 'Message queued for delivery');
        } catch (error) {
            next(error);
        }
    }

    async getStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await sessionService.getSessionStatus(
                req.user!.id,
                req.params.sessionId
            );
            ApiResponse.success(res, result);
        } catch (error) {
            next(error);
        }
    }
}
