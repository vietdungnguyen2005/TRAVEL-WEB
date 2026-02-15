export type IssueRefreshTokenInput = {
    userId: string;
    ip?: string;
    userAgent?: string;
    familyId?: string;
};

export type IssuedRefreshToken = {
    token: string;
    tokenId: string;
    familyId: string;
    expiresAt: Date;
};

export type RotateRefreshTokenResult =
    | { ok: true; userId: string; familyId: string; refresh: IssuedRefreshToken }
    | { ok: false; reason: 'NOT_FOUND' | 'EXPIRED' | 'REVOKED' | 'REUSE_DETECTED' };

export interface RefreshTokenRepository {
    issue(input: IssueRefreshTokenInput): Promise<IssuedRefreshToken>;
    rotate(input: { refreshToken: string; ip?: string; userAgent?: string }): Promise<RotateRefreshTokenResult>;
    revokeByRawToken(rawRefreshToken: string): Promise<void>;
    revokeAllByUserId(userId: string): Promise<void>;
}
