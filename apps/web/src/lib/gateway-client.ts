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
    const base = publicEnv.NEXT_PUBLIC_API_GATEWAY_URL.replace(/\/$/, "");
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

    // Default to attaching access token unless explicitly disabled.
    const shouldAttach = attachAccessToken !== false;

    if (shouldAttach) {
        const token = getAccessTokenFromCookie();
        if (token && !finalHeaders.has("Authorization")) {
            finalHeaders.set("Authorization", `Bearer ${token}`);
        }
    }

    return fetch(gatewayUrl(path), {
        ...rest,
        headers: finalHeaders,
    });
}
