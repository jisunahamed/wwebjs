import { prisma } from '../../config/database';
import { AppError } from '../../utils/errors';

export class AdminService {
    // List all users with their stats
    async listUsers(filters?: { status?: string; search?: string }) {
        const where: any = {};

        if (filters?.status === 'pending') where.isApproved = false;
        else if (filters?.status === 'approved') where.isApproved = true;
        else if (filters?.status === 'inactive') where.isActive = false;

        if (filters?.search) {
            where.OR = [
                { email: { contains: filters.search, mode: 'insensitive' } },
                { name: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                plan: true,
                maxSessions: true,
                isActive: true,
                isApproved: true,
                createdAt: true,
                _count: {
                    select: {
                        sessions: true,
                        apiKeys: true,
                        usageLogs: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Approve a user
    async approveUser(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);
        if (user.isApproved) throw new AppError('User is already approved', 400);

        return prisma.user.update({
            where: { id: userId },
            data: { isApproved: true },
            select: { id: true, email: true, name: true, isApproved: true },
        });
    }

    // Reject / remove a user
    async rejectUser(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);
        if (user.role === 'ADMIN') throw new AppError('Cannot reject admin user', 400);

        await prisma.user.delete({ where: { id: userId } });
        return { message: 'User rejected and removed' };
    }

    // Deactivate a user (soft ban)
    async toggleUserActive(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);
        if (user.role === 'ADMIN') throw new AppError('Cannot deactivate admin user', 400);

        return prisma.user.update({
            where: { id: userId },
            data: { isActive: !user.isActive },
            select: { id: true, email: true, isActive: true },
        });
    }

    // Update user plan
    async updateUserPlan(userId: string, plan: string, maxSessions?: number) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);

        const planLimits: Record<string, number> = {
            FREE: 2, STARTER: 5, PRO: 15, ENTERPRISE: 50,
        };

        return prisma.user.update({
            where: { id: userId },
            data: {
                plan: plan as any,
                maxSessions: maxSessions || planLimits[plan] || 2,
            },
            select: { id: true, email: true, plan: true, maxSessions: true },
        });
    }

    // Get dashboard stats
    async getStats() {
        const [totalUsers, pendingUsers, approvedUsers, totalSessions, activeSessions, totalMessages] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isApproved: false } }),
            prisma.user.count({ where: { isApproved: true } }),
            prisma.session.count(),
            prisma.session.count({ where: { status: 'CONNECTED' } }),
            prisma.message.count(),
        ]);

        return { totalUsers, pendingUsers, approvedUsers, totalSessions, activeSessions, totalMessages };
    }
}
