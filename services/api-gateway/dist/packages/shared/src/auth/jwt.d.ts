import jwt from 'jsonwebtoken';
export type JwtUser = {
    id?: string;
    role?: string;
    email?: string;
};
export declare function getJwtIssuer(): string | undefined;
export declare function getJwtAudience(): string | undefined;
export declare function getJwtVerifierKeyOrThrow(): {
    key: string;
    algorithms: jwt.Algorithm[];
};
export declare function extractAccessTokenFromHeaders(headers: {
    authorization?: unknown;
    cookie?: unknown;
}): string | undefined;
export declare function decodeJwtUser(payload: jwt.JwtPayload): JwtUser;
export declare function verifyJwtToken(token: string): jwt.JwtPayload;
//# sourceMappingURL=jwt.d.ts.map