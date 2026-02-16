import type { EmailVerificationRepository } from '../../application/auth/ports/email-verification.repository';
export declare class PrismaEmailVerificationRepository implements EmailVerificationRepository {
    upsertForUser(input: {
        userId: string;
        tokenHash: string;
        expiresAt: Date;
    }): Promise<void>;
    findByTokenHash(tokenHash: string): Promise<{
        id: string;
        userId: string;
        expiresAt: Date;
    } | null>;
    deleteById(id: string): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
}
//# sourceMappingURL=email-verification.prisma.repository.d.ts.map