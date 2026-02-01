import { cookies, headers } from 'next/headers';

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

function parseJwtPayload(token: string): any {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const payload = parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
        const json = Buffer.from(padded, 'base64').toString('utf8');
        return JSON.parse(json);
    } catch {
        return null;
    }
}

/**
 * Server-side auth helper.
 *
 * Contract:
 * - Looks for JWT in Authorization header (Bearer) or cookie `access_token`.
 * - Extracts user fields from JWT payload (best-effort).
 * - Returns null if missing/invalid.
 */
export async function auth(): Promise<AuthSession | null> {
    const h = await headers();
    const authHeader = h.get('authorization');

    let token: string | undefined;
    if (authHeader?.toLowerCase().startsWith('bearer ')) {
        token = authHeader.slice('bearer '.length).trim();
    }

    if (!token) {
        const c = await cookies();
        token = c.get('access_token')?.value;
    }

    if (!token) return null;

    const payload = parseJwtPayload(token);
    if (!payload) return null;

    // Common JWT claim names. Keep flexible.
    const user: AppUser = {
        id: payload.sub || payload.id || payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        phone: payload.phone ?? null,
    };

    if (!user.id) return null;

    return { user, accessToken: token };
}
