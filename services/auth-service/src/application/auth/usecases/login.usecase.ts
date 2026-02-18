import type { AuthUser } from '../../../domain/auth/auth.types';
import { AuthError } from '../auth.errors';
import type { JwtService } from '../ports/jwt.service';
import type { PasswordHasher } from '../ports/password-hasher';
import type { RefreshTokenRepository } from '../ports/refresh-token.repository';
import type { UserRepository } from '../ports/user.repository';

export type LoginInput = {
    email: string;
    password: string;
    ip?: string;
    userAgent?: string;
    requireEmailVerification: boolean;
};

export type LoginOutput = {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
};

export class LoginUseCase {
    constructor(
        private readonly deps: {
            users: UserRepository;
            passwordHasher: PasswordHasher;
            jwt: JwtService;
            refreshTokens: RefreshTokenRepository;
        }
    ) {}

    async execute(input: LoginInput): Promise<LoginOutput> {
        const email = input.email.toLowerCase().trim();
        const user = await this.deps.users.findByEmail(email);
        if (!user) throw new AuthError('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS');

        if (input.requireEmailVerification && !user.isVerified) {
            throw new AuthError('Tài khoản chưa xác nhận email', 'EMAIL_NOT_VERIFIED');
        }

        const ok = await this.deps.passwordHasher.compare(input.password, user.passwordHash);
        if (!ok) throw new AuthError('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS');

        const accessToken = this.deps.jwt.signAccessToken({ userId: user.id, role: user.role });
        const refresh = await this.deps.refreshTokens.issue({
            userId: user.id,
            ip: input.ip,
            userAgent: input.userAgent,
        });

        const { passwordHash: _pw, ...safeUser } = user;
        void _pw;
        return { user: safeUser, accessToken, refreshToken: refresh.token };
    }
}
