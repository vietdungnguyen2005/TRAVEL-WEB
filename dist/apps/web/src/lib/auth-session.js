import { cookies, headers } from 'next/headers';
function parseJwtPayload(token) {
    try {
        const parts = token.split('.');
        if (parts.length < 2)
            return null;
        const payload = parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
        const json = Buffer.from(padded, 'base64').toString('utf8');
        return JSON.parse(json);
    }
    catch {
        return null;
    }
}
/**
 * Minimal replacement for NextAuth `auth()`.
 *
 * Contract:
 * - Looks for JWT in Authorization header (Bearer) or cookie `access_token`.
 * - Extracts user fields from JWT payload (best-effort).
 * - Returns null if missing/invalid.
 */
export async function auth() {
    const h = await headers();
    const authHeader = h.get('authorization');
    let token;
    if (authHeader?.toLowerCase().startsWith('bearer ')) {
        token = authHeader.slice('bearer '.length).trim();
    }
    if (!token) {
        const c = await cookies();
        token = c.get('access_token')?.value;
    }
    if (!token)
        return null;
    const payload = parseJwtPayload(token);
    if (!payload)
        return null;
    // Common JWT claim names. Keep flexible.
    const user = {
        id: payload.sub || payload.id || payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        phone: payload.phone ?? null,
    };
    if (!user.id)
        return null;
    return { user, accessToken: token };
}
//# sourceMappingURL=auth-session.js.map