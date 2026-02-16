export type EmailVerification = {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
};
export interface EmailVerificationRepository {
    upsertForUser(input: {
        userId: string;
        tokenHash: string;
        expiresAt: Date;
    }): Promise<void>;
    findByTokenHash(tokenHash: string): Promise<Pick<EmailVerification, 'id' | 'userId' | 'expiresAt'> | null>;
    deleteById(id: string): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
}
//# sourceMappingURL=email-verification.repository.d.ts.map