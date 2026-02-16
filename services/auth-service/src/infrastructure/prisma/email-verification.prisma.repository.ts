import type { EmailVerificationRepository } from '../../application/auth/ports/email-verification.repository';
import { prisma } from '../../lib/prisma';

export class PrismaEmailVerificationRepository implements EmailVerificationRepository {
    async upsertForUser(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
        await prisma.emailVerification.upsert({
            where: { userId: input.userId },
            update: { token: input.tokenHash, expiresAt: input.expiresAt },
            create: { userId: input.userId, token: input.tokenHash, expiresAt: input.expiresAt },
            select: { id: true },
        });
    }

    async findByTokenHash(tokenHash: string) {
        const row = await prisma.emailVerification.findUnique({
            where: { token: tokenHash },
            select: { id: true, userId: true, expiresAt: true },
        });
        return row ?? null;
    }

    async deleteById(id: string): Promise<void> {
        await prisma.emailVerification.delete({ where: { id } });
    }

    async deleteByUserId(userId: string): Promise<void> {
        await prisma.emailVerification.delete({ where: { userId } });
    }
}
