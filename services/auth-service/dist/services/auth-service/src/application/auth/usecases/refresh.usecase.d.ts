import type { JwtService } from '../ports/jwt.service';
import type { RefreshTokenRepository } from '../ports/refresh-token.repository';
import type { UserRepository } from '../ports/user.repository';
import type { Role } from '../../../domain/auth/auth.types';
export type RefreshInput = {
    refreshToken: string;
    ip?: string;
    userAgent?: string;
};
export type RefreshOutput = {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name?: string | null;
        role: Role;
        isVerified: boolean;
    };
};
export declare class RefreshUseCase {
    private readonly deps;
    constructor(deps: {
        refreshTokens: RefreshTokenRepository;
        users: UserRepository;
        jwt: JwtService;
    });
    execute(input: RefreshInput): Promise<RefreshOutput>;
}
//# sourceMappingURL=refresh.usecase.d.ts.map