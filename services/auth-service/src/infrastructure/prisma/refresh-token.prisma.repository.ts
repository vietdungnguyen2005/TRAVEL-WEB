import type {
    RefreshTokenRepository,
    IssueRefreshTokenInput,
    IssuedRefreshToken,
    RotateRefreshTokenResult,
} from '../../application/auth/ports/refresh-token.repository';
import {
    issueRefreshToken,
    rotateRefreshToken,
    hashRefreshToken,
    revokeAllUserRefreshTokens,
    revokeRefreshTokenByHash,
} from '../../lib/refresh-tokens';

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
    async issue(input: IssueRefreshTokenInput): Promise<IssuedRefreshToken> {
        return issueRefreshToken(input);
    }

    async rotate(input: { refreshToken: string; ip?: string; userAgent?: string }): Promise<RotateRefreshTokenResult> {
        return rotateRefreshToken(input);
    }

    async revokeByRawToken(rawRefreshToken: string): Promise<void> {
        await revokeRefreshTokenByHash(hashRefreshToken(rawRefreshToken));
    }

    async revokeAllByUserId(userId: string): Promise<void> {
        await revokeAllUserRefreshTokens(userId);
    }
}
