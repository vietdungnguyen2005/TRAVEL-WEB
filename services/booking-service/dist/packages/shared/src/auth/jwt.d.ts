import jwt from 'jsonwebtoken';
export type JwtUser = {
    id?: string;
    role?: string;
    email?: string;
};
export declare function getJwtSecretOrThrow(): string;
export declare function extractAccessTokenFromHeaders(headers: {
    authorization?: unknown;
    cookie?: unknown;
}): string | undefined;
export declare function decodeJwtUser(payload: jwt.JwtPayload): JwtUser;
export declare function verifyJwtToken(token: string, secret: string): jwt.JwtPayload;
//# sourceMappingURL=jwt.d.ts.map