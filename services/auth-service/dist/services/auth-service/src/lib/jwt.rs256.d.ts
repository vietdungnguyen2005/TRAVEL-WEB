import { type SignOptions, type JwtPayload } from 'jsonwebtoken';
export type AccessTokenClaims = {
    sub: string;
    role: string;
    typ: 'access';
    name?: string;
    email?: string;
};
export type VerifiedAccessToken = JwtPayload & {
    sub: string;
    role: string;
    typ?: string;
};
export declare function getJwtIssuer(): string;
export declare function getJwtAudience(): string;
export declare function getJwtKeyId(): string;
export declare function getAccessTokenTtl(): SignOptions["expiresIn"];
export declare function getPrivateKeyPemOrThrow(): string;
export declare function getPublicKeyPemOrThrow(): string;
export declare function signAccessToken(claims: {
    userId: string;
    role: string;
    name?: string;
    email?: string;
}): string;
export declare function verifyAccessTokenOrThrow(token: string): VerifiedAccessToken;
export declare function getJwks(): {
    keys: {
        use: string;
        alg: string;
        kid: string;
    }[];
};
//# sourceMappingURL=jwt.rs256.d.ts.map