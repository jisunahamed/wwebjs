import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { AppError } from '../../utils/errors';

export class AuthService {
    async register(email: string, password: string, name?: string) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new AppError('Email already registered', 409);
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name },
            select: {
                id: true,
                email: true,
                name: true,
                plan: true,
                maxSessions: true,
                createdAt: true,
            },
        });

        // Auto-create default settings
        await prisma.userSettings.create({
            data: { userId: user.id },
        });

        const token = this.generateToken(user.id);
        return { user, token };
    }

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new AppError('Invalid email or password', 401);
        }

        if (!user.isActive) {
            throw new AppError('Account is deactivated', 403);
        }

        const token = this.generateToken(user.id);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                plan: user.plan,
                maxSessions: user.maxSessions,
            },
            token,
        };
    }

    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                plan: true,
                maxSessions: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: {
                        sessions: true,
                        apiKeys: true,
                    },
                },
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }

    private generateToken(userId: string): string {
        return jwt.sign({ userId }, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn,
        } as jwt.SignOptions);
    }
}
