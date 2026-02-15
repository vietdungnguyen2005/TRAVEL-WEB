import { publicEnv } from "./public-env";

export type GatewayFetchOptions = Omit<RequestInit, "headers"> & {
    headers?: HeadersInit;
    /**
     * If true, will attach Authorization header from `access_token` cookie if present.
     * Useful for client-side calls when gateway uses Bearer JWT.
     */
    attachAccessToken?: boolean;
};

function getAccessTokenFromCookie(): string | undefined {
    if (typeof document === "undefined") return undefined;

    const match = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("access_token="));

    if (!match) return undefined;
    const value = match.substring("access_token=".length);
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

export function gatewayUrl(path: string) {
    let base = publicEnv.NEXT_PUBLIC_API_GATEWAY_URL;
    // If the app is opened via LAN IP (e.g. http://192.168.x.x:3000) but the
    // gateway base is localhost, browser requests will go cross-origin and can
    // cause cookie/credentials surprises. In dev, rewrite localhost -> current host.
    if (typeof window !== "undefined") {
        try {
            const currentHost = window.location.hostname;
            if (currentHost && /^(localhost|127\.0\.0\.1)$/i.test(new URL(base).hostname)) {
                const u = new URL(base);
                u.hostname = currentHost;
                base = u.toString();
            }
        } catch {
            // ignore invalid base; fetch will fail and surface error to caller
        }
    }

    base = base.replace(/\/$/, "");
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${base}${p}`;
}

function getConnectionRefused(err: unknown): boolean {
    if (!err || typeof err !== 'object') return false;
    const o = err as Record<string, unknown>;
    if (o.code === 'ECONNREFUSED') return true;
    const cause = o.cause;
    if (cause && typeof cause === 'object') return getConnectionRefused(cause);
    const errors = o.errors as unknown[] | undefined;
    if (Array.isArray(errors) && errors.length) return getConnectionRefused(errors[0]);
    return false;
}

const isConnectionError = (err: unknown): boolean => {
    if (err instanceof TypeError && (err.message === 'fetch failed' || err.message?.includes('fetch'))) return true;
    return getConnectionRefused(err);
};

export async function gatewayFetch(path: string, options: GatewayFetchOptions = {}) {
    const { attachAccessToken, headers, ...rest } = options;

    const finalHeaders = new Headers(headers);

    // Default JSON for body requests unless caller overrides.
    if (!finalHeaders.has("Content-Type") && rest.body) {
        finalHeaders.set("Content-Type", "application/json");
    }

    if (attachAccessToken) {
        const token = getAccessTokenFromCookie();
        if (token && !finalHeaders.has("Authorization")) {
            finalHeaders.set("Authorization", `Bearer ${token}`);
        }
    }

    const url = gatewayUrl(path);
    const { retries: _retries, ...fetchOpts } = rest as RequestInit & { retries?: number };
    const method = (fetchOpts.method ?? 'GET').toUpperCase();
    const isServer = typeof window === 'undefined';
    // SSR: fail fast (2s) so pages don't block 12s when gateway is down. Client: retry for better UX.
    const maxRetries =
        typeof _retries === 'number'
            ? _retries
            : isServer
              ? 0
              : method === 'GET'
                ? 2
                : 0;
    const timeoutMs = isServer ? 2000 : 12000;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        let abortController: AbortController | undefined;
        let timeoutId: NodeJS.Timeout | undefined;

        if (!fetchOpts.signal && typeof AbortController !== 'undefined') {
            abortController = new AbortController();
            timeoutId = setTimeout(() => abortController?.abort(), timeoutMs);
        }

        try {
            const response = await fetch(url, {
                ...fetchOpts,
                headers: finalHeaders,
                credentials: 'include',
                signal: fetchOpts.signal || abortController?.signal,
            });
            if (timeoutId) clearTimeout(timeoutId);
            return response;
        } catch (error) {
            lastError = error;
            if (timeoutId) clearTimeout(timeoutId);
            if (attempt < maxRetries && method === 'GET' && isConnectionError(error)) {
                const delayMs = [800, 1600][attempt] ?? 1000;
                await new Promise((r) => setTimeout(r, delayMs));
                continue;
            }
            if (error instanceof Error) {
                console.error(`Gateway fetch failed for ${url}:`, error.message);
            }
            throw error;
        }
    }
    throw lastError;
}
