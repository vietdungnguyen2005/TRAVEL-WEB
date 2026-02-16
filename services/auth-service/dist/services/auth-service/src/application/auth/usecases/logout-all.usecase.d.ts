import type { RefreshTokenRepository } from '../ports/refresh-token.repository';
export declare class LogoutAllUseCase {
    private readonly deps;
    constructor(deps: {
        refreshTokens: RefreshTokenRepository;
    });
    execute(input: {
        userId: string;
    }): Promise<void>;
}
//# sourceMappingURL=logout-all.usecase.d.ts.map