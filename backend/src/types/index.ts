import { Plan } from '@prisma/client';

export interface AuthUser {
    id: string;
    email: string;
    plan: Plan;
    maxSessions: number;
    isActive: boolean;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export interface JwtPayload {
    userId: string;
    iat?: number;
    exp?: number;
}

export interface PaginationQuery {
    page?: number;
    limit?: number;
}
