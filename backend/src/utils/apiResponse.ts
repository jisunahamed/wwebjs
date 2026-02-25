import { Response } from 'express';

interface ApiResponseOptions {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}

export class ApiResponse {
    static success(res: Response, data: any, statusCode: number = 200, message?: string) {
        const response: ApiResponseOptions = {
            success: true,
            data,
        };
        if (message) response.message = message;
        return res.status(statusCode).json(response);
    }

    static created(res: Response, data: any, message: string = 'Created successfully') {
        return this.success(res, data, 201, message);
    }

    static error(res: Response, error: string, statusCode: number = 500) {
        return res.status(statusCode).json({
            success: false,
            error,
        });
    }

    static paginated(
        res: Response,
        data: any[],
        total: number,
        page: number,
        limit: number
    ) {
        return res.status(200).json({
            success: true,
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
}
