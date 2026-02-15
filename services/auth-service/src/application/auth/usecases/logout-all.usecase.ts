import type { RefreshTokenRepository } from '../ports/refresh-token.repository';

export class LogoutAllUseCase {
    constructor(private readonly deps: { refreshTokens: RefreshTokenRepository }) {}

    async execute(input: { userId: string }) {
        await this.deps.refreshTokens.revokeAllByUserId(input.userId);
    }
}
