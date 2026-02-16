import { createHash } from 'crypto';
import { AuthError } from '../auth.errors';
import type { EmailVerificationRepository } from '../ports/email-verification.repository';
import type { UserRepository } from '../ports/user.repository';

export type VerifyEmailInput = {
    token: string;
};

export type VerifyEmailOutput = {
    success: true;
};

export class VerifyEmailUseCase {
    constructor(
        private readonly deps: {
            emailVerifications: EmailVerificationRepository;
            users: UserRepository;
        }
    ) {}

    async execute(input: VerifyEmailInput): Promise<VerifyEmailOutput> {
        const token = input.token?.toString().trim();
        if (!token) throw new AuthError('Token không hợp lệ', 'INVALID_VERIFICATION_TOKEN');

        const tokenHash = createHash('sha256').update(token).digest('hex');
        const record = await this.deps.emailVerifications.findByTokenHash(tokenHash);
        if (!record) throw new AuthError('Token không hợp lệ', 'INVALID_VERIFICATION_TOKEN');

        if (record.expiresAt.getTime() < Date.now()) {
            await this.deps.emailVerifications.deleteById(record.id).catch(() => undefined);
            throw new AuthError('Token đã hết hạn', 'EXPIRED_VERIFICATION_TOKEN');
        }

        await this.deps.users.markVerified(record.userId);
        await this.deps.emailVerifications.deleteById(record.id);

        return { success: true };
    }
}
