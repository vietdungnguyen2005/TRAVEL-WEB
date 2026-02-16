"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const prisma_1 = require("../../lib/prisma");
exports.adminRouter = (0, express_1.Router)();
function tryGetPrismaErrorCode(err) {
    if (typeof err !== 'object' || err === null)
        return undefined;
    if (!('code' in err))
        return undefined;
    const code = err.code;
    return typeof code === 'string' ? code : undefined;
}
exports.adminRouter.use(auth_1.requireAuth, (0, auth_1.requireRole)('ADMIN'));
// GET /api/admin/users - list users (gateway forwards /api/admin/users here)
exports.adminRouter.get('/users', async (_req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
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
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to list users' });
    }
});
// PATCH /api/admin/users/:userId/role - update user role (used by web admin users page)
exports.adminRouter.patch('/users/:userId/role', async (req, res) => {
    const userId = req.params.userId;
    const role = req.body?.role?.toUpperCase();
    if (!role || !['ADMIN', 'CUSTOMER'].includes(role)) {
        return res.status(400).json({ message: 'role must be ADMIN or CUSTOMER' });
    }
    try {
        const user = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { role: role },
            select: { id: true, email: true, role: true },
        });
        res.json(user);
    }
    catch (err) {
        if (tryGetPrismaErrorCode(err) === 'P2025')
            return res.status(404).json({ message: 'User not found' });
        res.status(500).json({ error: 'Failed to update role' });
    }
});
// GET /api/admin/stats - minimal dashboard stats (user count; booking/room stats come from other services)
exports.adminRouter.get('/stats', async (_req, res) => {
    try {
        const totalUsers = await prisma_1.prisma.user.count();
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
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get stats' });
    }
});
// GET /api/admin/analytics - placeholder (full analytics can aggregate from booking/room later)
exports.adminRouter.get('/analytics', async (req, res) => {
    const months = Math.min(12, Math.max(1, Number(req.query.months) || 6));
    try {
        res.json({
            labels: [],
            bookings: [],
            revenue: [],
            periodMonths: months,
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});
//# sourceMappingURL=admin.js.map