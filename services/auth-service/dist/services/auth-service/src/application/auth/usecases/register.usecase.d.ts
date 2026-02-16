import type { AuthUser, Role } from '../../../domain/auth/auth.types';
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
export type RegisterOutput = {
    status: 'NEEDS_EMAIL_VERIFICATION';
    user: AuthUser;
} | {
    status: 'OK';
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
};
export declare class RegisterUseCase {
    private readonly deps;
    constructor(deps: {
        users: UserRepository;
        passwordHasher: PasswordHasher;
        jwt: JwtService;
        refreshTokens: RefreshTokenRepository;
        emailVerifications: EmailVerificationRepository;
        email: EmailService;
        webAppUrl?: string;
    });
    execute(input: RegisterInput): Promise<RegisterOutput>;
}
//# sourceMappingURL=register.usecase.d.ts.map