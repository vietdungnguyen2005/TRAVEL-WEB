import { createHash, randomBytes } from 'crypto';
import type { AuthUser, Role } from '../../../domain/auth/auth.types';
import { AuthError } from '../auth.errors';
import type { EmailService } from '../ports/email.service';
import type { EmailVerificationRepository } from '../ports/email-verification.repository';
import type { JwtService } from '../ports/jwt.service';
import type { PasswordHasher } from '../ports/password-hasher';
import type { RefreshTokenRepository } from '../ports/refresh-token.repository';
import type { UserRepository } from '../ports/user.repository';

export type RegisterInput = {
    name?: string;
    email: string;
    password: string;
    role?: Role;
    ip?: string;
    userAgent?: string;
    requireEmailVerification: boolean;
};

export type RegisterOutput =
    | {
          status: 'NEEDS_EMAIL_VERIFICATION';
          user: AuthUser;
      }
    | {
          status: 'OK';
          user: AuthUser;
          accessToken: string;
          refreshToken: string;
      };

export class RegisterUseCase {
    constructor(
        private readonly deps: {
            users: UserRepository;
            passwordHasher: PasswordHasher;
            jwt: JwtService;
            refreshTokens: RefreshTokenRepository;
            emailVerifications: EmailVerificationRepository;
            email: EmailService;
            webAppUrl?: string;
        }
    ) {}

    async execute(input: RegisterInput): Promise<RegisterOutput> {
        const email = input.email.toLowerCase().trim();
        const existing = await this.deps.users.findByEmail(email);
        if (existing) throw new AuthError('Email đã được sử dụng', 'EMAIL_IN_USE');

        const passwordHash = await this.deps.passwordHasher.hash(input.password);
        const mustVerify = input.requireEmailVerification;

        const user = await this.deps.users.create({
            email,
            passwordHash,
            name: input.name,
            role: input.role ?? 'CUSTOMER',
            isVerified: mustVerify ? false : true,
            verificationToken: null,
        });

        if (mustVerify) {
            const rawToken = randomBytes(32).toString('hex');
            const tokenHash = createHash('sha256').update(rawToken).digest('hex');

            const ttlMinutes = Number(process.env.EMAIL_VERIFICATION_TTL_MINUTES || 30);
            const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

            await this.deps.emailVerifications.upsertForUser({ userId: user.id, tokenHash, expiresAt });

            const web = this.deps.webAppUrl;
            if (!web) {
                throw new AuthError('Không thể gửi email xác thực lúc này', 'VALIDATION_ERROR');
            }

            const verifyUrl = `${web}/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
            await this.deps.email.sendVerificationEmail({ to: email, name: user.name ?? undefined, verifyUrl });

            return { status: 'NEEDS_EMAIL_VERIFICATION', user };
        }

        const accessToken = this.deps.jwt.signAccessToken({ userId: user.id, role: user.role, name: user.name ?? undefined, email: user.email });
        const refresh = await this.deps.refreshTokens.issue({
            userId: user.id,
            ip: input.ip,
            userAgent: input.userAgent,
        });

        return { status: 'OK', user, accessToken, refreshToken: refresh.token };
    }
}
