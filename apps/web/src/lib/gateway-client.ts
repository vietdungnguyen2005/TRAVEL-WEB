import { publicEnv } from "./public-env";

export type GatewayFetchOptions = Omit<RequestInit, "headers"> & {
    headers?: HeadersInit;
    /**
     * If true, will attach Authorization header from `access_token` cookie if present.
     * Useful for client-side calls when gateway uses Bearer JWT.
     */
    attachAccessToken?: boolean;
    /**
     * If true (default), on 401 will attempt a token refresh then retry once.
     */
    autoRefresh?: boolean;
};

function getAccessTokenFromCookie(): string | undefined {
    if (typeof document === "undefined") return undefined;
    const match = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("access_token="));
    if (!match) return undefined;
    try {
        return decodeURIComponent(match.substring("access_token=".length));
    } catch {
        return match.substring("access_token=".length);
    }
}

function getRefreshTokenFromCookie(): string | undefined {
    if (typeof document === "undefined") return undefined;
    const match = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("refresh_token="));
    if (!match) return undefined;
    try {
        return decodeURIComponent(match.substring("refresh_token=".length));
    } catch {
        return match.substring("refresh_token=".length);
    }
}

/* ── Token refresh lock (shared across concurrent requests) ── */
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const refreshToken = getRefreshTokenFromCookie();
            if (!refreshToken) return false;

            const res = await fetch(
                `${publicEnv.NEXT_PUBLIC_API_GATEWAY_URL}/api/auth/refresh`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken }),
                    credentials: "include",
                },
            );
            if (!res.ok) return false;

            // Extract new tokens from response body and update cookies
            const data = await res.json().catch(() => null);
            if (data?.accessToken) {
                document.cookie = `access_token=${encodeURIComponent(data.accessToken)}; Path=/; Max-Age=900; SameSite=Lax`;
            }
            if (data?.refreshToken) {
                document.cookie = `refresh_token=${encodeURIComponent(data.refreshToken)}; Path=/; Max-Age=604800; SameSite=Lax`;
            }
            return true;
        } catch {
            return false;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export function gatewayUrl(path: string) {
    const base = publicEnv.NEXT_PUBLIC_API_GATEWAY_URL.replace(/\/$/, "");
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${base}${p}`;
}

export async function gatewayFetch(
    path: string,
    opts: GatewayFetchOptions = {},
): Promise<Response> {
    const {
        headers: userHeaders,
        attachAccessToken,
        autoRefresh = true,
        ...rest
    } = opts;

    const buildHeaders = () => {
        const h = new Headers(userHeaders);
        if (attachAccessToken !== false) {
            const token = getAccessTokenFromCookie();
            if (token && !h.has("Authorization")) {
                h.set("Authorization", `Bearer ${token}`);
            }
        }
        // Auto-set Content-Type for string bodies (JSON.stringify) when not
        // already provided and the body is NOT FormData (multipart).
        if (
            rest.body &&
            typeof rest.body === "string" &&
            !h.has("Content-Type")
        ) {
            h.set("Content-Type", "application/json");
        }
        return h;
    };

    const url = gatewayUrl(path);

    const res = await fetch(url, {
        ...rest,
        headers: buildHeaders(),
        credentials: "include",
    });

    // Auto-refresh on 401 (only once, and not for auth endpoints)
    if (
        res.status === 401 &&
        autoRefresh &&
        !path.includes("/auth/refresh") &&
        !path.includes("/auth/login")
    ) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
            // Retry with fresh token
            return fetch(url, {
                ...rest,
                headers: buildHeaders(),
                credentials: "include",
            });
        }

        // Refresh failed → redirect to login
        if (typeof window !== "undefined") {
            const cur = window.location.pathname + window.location.search;
            if (!cur.startsWith("/auth/login")) {
                window.location.href = `/auth/login?redirect=${encodeURIComponent(cur)}`;
            }
        }
    }

    return res;
}
