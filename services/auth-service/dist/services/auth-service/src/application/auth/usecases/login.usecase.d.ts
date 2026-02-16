import type { AuthUser } from '../../../domain/auth/auth.types';
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
export declare class LoginUseCase {
    private readonly deps;
    constructor(deps: {
        users: UserRepository;
        passwordHasher: PasswordHasher;
        jwt: JwtService;
        refreshTokens: RefreshTokenRepository;
    });
    execute(input: LoginInput): Promise<LoginOutput>;
}
//# sourceMappingURL=login.usecase.d.ts.map