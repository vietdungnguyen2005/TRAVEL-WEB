"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaEmailVerificationRepository = void 0;
const prisma_1 = require("../../lib/prisma");
class PrismaEmailVerificationRepository {
    async upsertForUser(input) {
        await prisma_1.prisma.emailVerification.upsert({
            where: { userId: input.userId },
            update: { token: input.tokenHash, expiresAt: input.expiresAt },
            create: { userId: input.userId, token: input.tokenHash, expiresAt: input.expiresAt },
            select: { id: true },
        });
    }
    async findByTokenHash(tokenHash) {
        const row = await prisma_1.prisma.emailVerification.findUnique({
            where: { token: tokenHash },
            select: { id: true, userId: true, expiresAt: true },
        });
        return row ?? null;
    }
    async deleteById(id) {
        await prisma_1.prisma.emailVerification.delete({ where: { id } });
    }
    async deleteByUserId(userId) {
        await prisma_1.prisma.emailVerification.delete({ where: { userId } });
    }
}
exports.PrismaEmailVerificationRepository = PrismaEmailVerificationRepository;
//# sourceMappingURL=email-verification.prisma.repository.js.map