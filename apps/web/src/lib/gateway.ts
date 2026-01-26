import { NextRequest } from 'next/server';

/**
 * Small helper to call the canonical API Gateway from Next Route Handlers.
 *
 * Contract:
 * - Uses `process.env.API_GATEWAY_URL` (fallback `http://localhost:4000`).
 * - Forwards Authorization & Cookie headers when present (best-effort).
 * - Never forwards Hop-by-hop headers.
 */
export function getGatewayBaseUrl() {
    return process.env.API_GATEWAY_URL || 'http://localhost:4000';
}

export async function gatewayFetch(
    req: NextRequest | undefined,
    path: string,
    init?: RequestInit
) {
    const baseUrl = getGatewayBaseUrl();
    const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const headers = new Headers(init?.headers);

    // Forward auth context if available.
    if (req) {
        const auth = req.headers.get('authorization');
        const cookie = req.headers.get('cookie');
        if (auth && !headers.has('authorization')) headers.set('authorization', auth);
        if (cookie && !headers.has('cookie')) headers.set('cookie', cookie);
    }

    // Ensure JSON by default when body is objectified upstream.
    if (!headers.has('accept')) headers.set('accept', 'application/json');

    return fetch(url, {
        ...init,
        headers,
        // Don't cache API calls by default in route handlers.
        cache: 'no-store',
    });
}
