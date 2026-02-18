import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth';
import { prisma } from '../../lib/prisma';

export const adminRouter = Router();

function tryGetPrismaErrorCode(err: unknown): string | undefined {
    if (typeof err !== 'object' || err === null) return undefined;
    if (!('code' in err)) return undefined;
    const code = (err as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
}

adminRouter.use(requireAuth, requireRole('ADMIN'));

// GET /api/admin/users - list users (gateway forwards /api/admin/users here)
adminRouter.get('/users', async (_req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.json(users);
    } catch {
        res.status(500).json({ error: 'Failed to list users' });
    }
});

// PATCH /api/admin/users/:userId/role - update user role (used by web admin users page)
adminRouter.patch('/users/:userId/role', async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const role = (req.body?.role as string)?.toUpperCase();
    if (!role || !['ADMIN', 'CUSTOMER'].includes(role)) {
        return res.status(400).json({ message: 'role must be ADMIN or CUSTOMER' });
    }
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { role: role as 'ADMIN' | 'CUSTOMER' },
            select: { id: true, email: true, role: true },
        });
        res.json(user);
    } catch (err: unknown) {
        if (tryGetPrismaErrorCode(err) === 'P2025') return res.status(404).json({ message: 'User not found' });
        res.status(500).json({ error: 'Failed to update role' });
    }
});

// GET /api/admin/stats - minimal dashboard stats (user count; booking/room stats come from other services)
adminRouter.get('/stats', async (_req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();
        res.json({
            totalUsers,
            totalBookings: 0,
            totalRooms: 0,
            pendingBookings: 0,
            revenueThisMonth: 0,
            revenueGrowth: 0,
            bookingsThisMonth: 0,
            bookingGrowth: 0,
            recentBookings: [],
        });
    } catch {
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// GET /api/admin/analytics - placeholder (full analytics can aggregate from booking/room later)
adminRouter.get('/analytics', async (req: Request, res: Response) => {
    const months = Math.min(12, Math.max(1, Number(req.query.months) || 6));
    try {
        res.json({
            labels: [],
            bookings: [],
            revenue: [],
            periodMonths: months,
        });
    } catch {
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});
