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

        // Enrich with booking count from booking schema (same Supabase DB)
        let bookingCounts = new Map<string, number>();
        try {
            const counts = await prisma.$queryRawUnsafe<{ userId: string; count: bigint }[]>(
                `SELECT "userId", COUNT(*)::bigint as count FROM booking.bookings GROUP BY "userId"`
            );
            for (const c of counts) {
                bookingCounts.set(c.userId, Number(c.count));
            }
        } catch {
            // booking schema might not exist yet — ignore
        }

        res.json(
            users.map((u) => ({
                ...u,
                _count: { bookings: bookingCounts.get(u.id) || 0 },
            }))
        );
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

// GET /api/admin/stats - dashboard stats aggregated from shared DB
adminRouter.get('/stats', async (_req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();

        let totalBookings = 0;
        let pendingBookings = 0;
        let totalRooms = 0;
        let revenueThisMonth = 0;
        let bookingsThisMonth = 0;

        try {
            const bookingStats = await prisma.$queryRawUnsafe<{ total: bigint; pending: bigint }[]>(
                `SELECT
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE status = 'PENDING') as pending
                 FROM booking.bookings`
            );
            if (bookingStats.length > 0) {
                totalBookings = Number(bookingStats[0].total);
                pendingBookings = Number(bookingStats[0].pending);
            }

            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const thisMonthStats = await prisma.$queryRawUnsafe<{ count: bigint; revenue: number }[]>(
                `SELECT COUNT(*) as count, COALESCE(SUM("totalPrice"::float), 0) as revenue
                 FROM booking.bookings
                 WHERE "createdAt" >= $1 AND status != 'CANCELLED'`,
                monthStart,
            );
            if (thisMonthStats.length > 0) {
                bookingsThisMonth = Number(thisMonthStats[0].count);
                revenueThisMonth = thisMonthStats[0].revenue || 0;
            }
        } catch {
            // booking schema may not exist yet
        }

        try {
            const roomStats = await prisma.$queryRawUnsafe<{ total: bigint }[]>(
                `SELECT COUNT(*) as total FROM room."Room"`
            );
            if (roomStats.length > 0) {
                totalRooms = Number(roomStats[0].total);
            }
        } catch {
            // room schema may not exist yet
        }

        res.json({
            totalUsers,
            totalBookings,
            totalRooms,
            pendingBookings,
            revenueThisMonth,
            revenueGrowth: 0,
            bookingsThisMonth,
            bookingGrowth: 0,
            recentBookings: [],
        });
    } catch {
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// GET /api/admin/analytics - aggregate booking stats from shared DB
adminRouter.get('/analytics', async (req: Request, res: Response) => {
    const months = Math.min(12, Math.max(1, Number(req.query.months) || 6));
    try {
        // Query booking schema cross-schema (same Supabase DB)
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const bookings = await prisma.$queryRawUnsafe<
            { id: string; status: string; total_price: number; created_at: Date }[]
        >(
            `SELECT id, status, "totalPrice"::float as total_price, "createdAt" as created_at
             FROM booking.bookings
             WHERE "createdAt" >= $1
             ORDER BY "createdAt" ASC`,
            startDate,
        );

        const totalBookings = bookings.filter((b) => b.status !== 'CANCELLED').length;
        const allBookings = bookings.length;
        const completionRate = allBookings > 0 ? (totalBookings / allBookings) * 100 : 0;
        const totalRevenue = bookings
            .filter((b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED')
            .reduce((sum, b) => sum + (b.total_price || 0), 0);
        const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

        // Group by month
        const monthlyMap = new Map<string, { revenue: number; bookings: number }>();
        for (let i = 0; i < months; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (months - 1 - i));
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap.set(key, { revenue: 0, bookings: 0 });
        }

        for (const b of bookings) {
            if (b.status === 'CANCELLED') continue;
            const d = new Date(b.created_at);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const entry = monthlyMap.get(key);
            if (entry) {
                entry.bookings += 1;
                if (b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
                    entry.revenue += b.total_price || 0;
                }
            }
        }

        const monthlyData = Array.from(monthlyMap.entries()).map(([key, val]) => ({
            month: key,
            revenue: val.revenue,
            bookings: val.bookings,
        }));

        res.json({
            totalRevenue,
            averageBookingValue,
            totalBookings,
            completionRate,
            monthlyData,
        });
    } catch (err) {
        console.error('Analytics error:', err);
        // Fallback: return empty but correctly-shaped response
        res.json({
            totalRevenue: 0,
            averageBookingValue: 0,
            totalBookings: 0,
            completionRate: 0,
            monthlyData: [],
        });
    }
});
