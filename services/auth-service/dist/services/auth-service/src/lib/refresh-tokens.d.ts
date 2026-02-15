export type RefreshTokenPair = {
    token: string;
    familyId: string;
    expiresAt: Date;
    tokenId: string;
};
export declare function hashRefreshToken(token: string): string;
export declare function getRefreshTokenTtlMs(): number;
export declare function generateOpaqueRefreshToken(): string;
export declare function issueRefreshToken(params: {
    userId: string;
    ip?: string;
    userAgent?: string;
    familyId?: string;
    client?: unknown;
}): Promise<RefreshTokenPair>;
export declare function revokeRefreshTokenByHash(tokenHash: string): Promise<void>;
export declare function revokeRefreshTokenFamily(familyId: string): Promise<void>;
export declare function revokeAllUserRefreshTokens(userId: string): Promise<void>;
export declare function rotateRefreshToken(params: {
    refreshToken: string;
    ip?: string;
    userAgent?: string;
}): Promise<{
    ok: false;
    reason: "NOT_FOUND";
    userId?: undefined;
    familyId?: undefined;
    refresh?: undefined;
} | {
    ok: false;
    reason: "EXPIRED";
    userId?: undefined;
    familyId?: undefined;
    refresh?: undefined;
} | {
    ok: false;
    reason: "REUSE_DETECTED";
    userId?: undefined;
    familyId?: undefined;
    refresh?: undefined;
} | {
    ok: false;
    reason: "REVOKED";
    userId?: undefined;
    familyId?: undefined;
    refresh?: undefined;
} | {
    ok: true;
    userId: any;
    familyId: any;
    refresh: RefreshTokenPair;
    reason?: undefined;
}>;
//# sourceMappingURL=refresh-tokens.d.ts.map