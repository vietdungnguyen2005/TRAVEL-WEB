import type { RefreshTokenRepository } from '../ports/refresh-token.repository';

export class LogoutUseCase {
    constructor(private readonly deps: { refreshTokens: RefreshTokenRepository }) {}

    async execute(input: { refreshToken?: string | null }) {
        if (!input.refreshToken) return;
        await this.deps.refreshTokens.revokeByRawToken(input.refreshToken);
    }
}
