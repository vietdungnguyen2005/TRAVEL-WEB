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

    return fetch(gatewayUrl(path), {
        ...rest,
        headers: finalHeaders,
        // Required so the browser will accept Set-Cookie from the gateway
        // and send cookies on subsequent requests (cookie-based auth).
        credentials: 'include',
    });
}
