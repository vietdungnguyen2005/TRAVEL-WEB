import { randomBytes } from 'crypto';
import type { AuthUser, Role } from '../../../domain/auth/auth.types';
import { AuthError } from '../auth.errors';
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
          verificationToken: string;
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
        }
    ) {}

    async execute(input: RegisterInput): Promise<RegisterOutput> {
        const email = input.email.toLowerCase().trim();
        const existing = await this.deps.users.findByEmail(email);
        if (existing) throw new AuthError('Email đã được sử dụng', 'EMAIL_IN_USE');

        const passwordHash = await this.deps.passwordHasher.hash(input.password);

        const verificationToken = randomBytes(24).toString('hex');
        const mustVerify = input.requireEmailVerification;

        const user = await this.deps.users.create({
            email,
            passwordHash,
            name: input.name,
            role: input.role ?? 'CUSTOMER',
            isVerified: mustVerify ? false : true,
            verificationToken: mustVerify ? verificationToken : null,
        });

        if (mustVerify) {
            return { status: 'NEEDS_EMAIL_VERIFICATION', user, verificationToken };
        }

        const accessToken = this.deps.jwt.signAccessToken({ userId: user.id, role: user.role });
        const refresh = await this.deps.refreshTokens.issue({
            userId: user.id,
            ip: input.ip,
            userAgent: input.userAgent,
        });

        return { status: 'OK', user, accessToken, refreshToken: refresh.token };
    }
}
