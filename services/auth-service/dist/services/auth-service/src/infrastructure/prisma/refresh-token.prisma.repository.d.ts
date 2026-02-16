import type { RefreshTokenRepository, IssueRefreshTokenInput, IssuedRefreshToken, RotateRefreshTokenResult } from '../../application/auth/ports/refresh-token.repository';
export declare class PrismaRefreshTokenRepository implements RefreshTokenRepository {
    issue(input: IssueRefreshTokenInput): Promise<IssuedRefreshToken>;
    rotate(input: {
        refreshToken: string;
        ip?: string;
        userAgent?: string;
    }): Promise<RotateRefreshTokenResult>;
    revokeByRawToken(rawRefreshToken: string): Promise<void>;
    revokeAllByUserId(userId: string): Promise<void>;
}
//# sourceMappingURL=refresh-token.prisma.repository.d.ts.map