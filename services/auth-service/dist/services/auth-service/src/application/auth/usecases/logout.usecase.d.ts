import type { RefreshTokenRepository } from '../ports/refresh-token.repository';
export declare class LogoutUseCase {
    private readonly deps;
    constructor(deps: {
        refreshTokens: RefreshTokenRepository;
    });
    execute(input: {
        refreshToken?: string | null;
    }): Promise<void>;
}
//# sourceMappingURL=logout.usecase.d.ts.map