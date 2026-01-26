export type AppUser = {
    id: string;
    email?: string;
    name?: string;
    role?: string;
    phone?: string | null;
};
export type AuthSession = {
    user: AppUser;
    accessToken?: string;
};
/**
 * Minimal replacement for NextAuth `auth()`.
 *
 * Contract:
 * - Looks for JWT in Authorization header (Bearer) or cookie `access_token`.
 * - Extracts user fields from JWT payload (best-effort).
 * - Returns null if missing/invalid.
 */
export declare function auth(): Promise<AuthSession | null>;
//# sourceMappingURL=auth-session.d.ts.map