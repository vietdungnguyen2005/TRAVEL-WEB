import { cookies } from "next/headers";
import { publicEnv } from "./public-env";

export type GatewayFetchServerOptions = Omit<RequestInit, "headers"> & {
    headers?: HeadersInit;
    /** If true, forwards Cookie header (default: true) */
    forwardCookies?: boolean;
};

function gatewayUrl(path: string) {
    const base = publicEnv.NEXT_PUBLIC_API_GATEWAY_URL.replace(/\/$/, "");
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${base}${p}`;
}

/**
 * Server-side fetch to API gateway.
 * - Forwards cookies so gateway can read `access_token` if it supports cookie-based auth.
 * - Also works for protected routes when Bearer token is required (gateway can parse cookie and set auth).
 */
export async function gatewayFetchServer(path: string, options: GatewayFetchServerOptions = {}) {
    const { headers, forwardCookies, ...rest } = options;

    const finalHeaders = new Headers(headers);

    // Default JSON for body requests unless caller overrides.
    if (!finalHeaders.has("Content-Type") && rest.body) {
        finalHeaders.set("Content-Type", "application/json");
    }

    // Forward cookies by default (for auth via cookie).
    const shouldForward = forwardCookies !== false;
    if (shouldForward && !finalHeaders.has("Cookie")) {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
            .join("; ");
        if (cookieHeader) finalHeaders.set("Cookie", cookieHeader);
    }

    return fetch(gatewayUrl(path), {
        ...rest,
        headers: finalHeaders,
    });
}

