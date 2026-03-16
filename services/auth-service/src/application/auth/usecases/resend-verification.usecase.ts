import { createHash, randomBytes } from 'crypto';
import type { EmailService } from '../ports/email.service';
import type { EmailVerificationRepository } from '../ports/email-verification.repository';
import type { UserRepository } from '../ports/user.repository';

export type ResendVerificationInput = {
    email: string;
};

export type ResendVerificationOutput = {
    success: true;
};

export class ResendVerificationUseCase {
    constructor(
        private readonly deps: {
            users: UserRepository;
            emailVerifications: EmailVerificationRepository;
            email: EmailService;
            webAppUrl?: string;
        }
    ) {}

    async execute(input: ResendVerificationInput): Promise<ResendVerificationOutput> {
        const email = input.email.toLowerCase().trim();
        const user = await this.deps.users.findByEmail(email);

        // Don't reveal whether email exists
        if (!user) return { success: true };

        // Don't reveal verification status – same response as non-existent email
        if (user.isVerified) return { success: true };

        const rawToken = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(rawToken).digest('hex');

        const ttlMinutes = Number(process.env.EMAIL_VERIFICATION_TTL_MINUTES || 30);
        const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

        await this.deps.emailVerifications.upsertForUser({ userId: user.id, tokenHash, expiresAt });

        const web = this.deps.webAppUrl;
        if (web) {
            const verifyUrl = `${web}/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
            try {
                await this.deps.email.sendVerificationEmail({ to: email, name: user.name ?? undefined, verifyUrl });
            } catch (emailErr) {
                // Log but don't fail — token is already saved, user can retry
                console.error('[ResendVerificationUseCase] Failed to send verification email:', emailErr instanceof Error ? emailErr.message : emailErr);
            }
        }

        return { success: true };
    }
}
