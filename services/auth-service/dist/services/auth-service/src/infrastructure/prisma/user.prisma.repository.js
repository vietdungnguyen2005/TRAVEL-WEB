"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const prisma_1 = require("../../lib/prisma");
class PrismaUserRepository {
    async findByEmail(email) {
        const row = await prisma_1.prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true, role: true, isVerified: true, password: true },
        });
        if (!row)
            return null;
        return {
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role,
            isVerified: row.isVerified,
            passwordHash: row.password,
        };
    }
    async findById(id) {
        const row = await prisma_1.prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, name: true, role: true, isVerified: true },
        });
        if (!row)
            return null;
        return {
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role,
            isVerified: row.isVerified,
        };
    }
    async create(input) {
        const row = await prisma_1.prisma.user.create({
            data: {
                email: input.email,
                password: input.passwordHash,
                name: input.name ?? null,
                role: input.role,
                isVerified: input.isVerified,
                verificationToken: input.verificationToken ?? null,
            },
            select: { id: true, email: true, name: true, role: true, isVerified: true },
        });
        return {
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role,
            isVerified: row.isVerified,
        };
    }
    async markVerified(userId) {
        await prisma_1.prisma.user.update({ where: { id: userId }, data: { isVerified: true } });
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
//# sourceMappingURL=user.prisma.repository.js.map