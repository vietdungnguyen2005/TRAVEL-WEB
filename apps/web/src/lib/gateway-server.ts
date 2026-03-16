import { cookies } from "next/headers";
import { publicEnv } from "./public-env";

export type GatewayFetchServerOptions = Omit<RequestInit, "headers"> & {
    headers?: HeadersInit;
    /** If true, forwards Cookie header (default: true) */
    forwardCookies?: boolean;
    /** If true (default), on 401 will attempt token refresh via server-side cookie, then retry. */
    autoRefresh?: boolean;
};

function gatewayUrl(path: string) {
    const base = publicEnv.NEXT_PUBLIC_API_GATEWAY_URL.replace(/\/$/, "");
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${base}${p}`;
}

async function buildCookieHeader(): Promise<string> {
    const jar = await cookies();
    return jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
}

/**
 * Attempt a server-side token refresh by POSTing to /api/auth/refresh
 * with the current cookies.  Returns the Set-Cookie header values on
 * success so the caller can forward them, or null on failure.
 */
async function tryServerRefresh(cookieHeader: string): Promise<{
    ok: boolean;
    newCookies: string[];
} | null> {
    try {
        const res = await fetch(gatewayUrl("/api/auth/refresh"), {
            method: "POST",
            headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
            body: "{}",
            cache: "no-store",
        });

        if (!res.ok) return null;

        // Collect Set-Cookie headers from the refresh response
        const setCookies: string[] = [];
        res.headers.forEach((value, key) => {
            if (key.toLowerCase() === "set-cookie") {
                setCookies.push(value);
            }
        });

        return { ok: true, newCookies: setCookies };
    } catch {
        return null;
    }
}

/**
 * Server-side fetch wrapper.
 *
 * For use in Server Components / Server Actions / Route Handlers.
 * Automatically forwards cookies and handles 401 → refresh → retry.
 */
export async function gatewayFetchServer(
    path: string,
    opts: GatewayFetchServerOptions = {},
): Promise<Response> {
    const {
        headers: userHeaders,
        forwardCookies = true,
        autoRefresh = true,
        ...rest
    } = opts;

    const url = gatewayUrl(path);

    const buildHeaders = async () => {
        const h = new Headers(userHeaders);
        if (forwardCookies) {
            const cookieHeader = await buildCookieHeader();
            if (cookieHeader) h.set("Cookie", cookieHeader);
        }
        return h;
    };

    const headers = await buildHeaders();
    const res = await fetch(url, { ...rest, headers, cache: "no-store" });

    // Server-side auto-refresh on 401
    if (
        res.status === 401 &&
        autoRefresh &&
        !path.includes("/auth/refresh") &&
        !path.includes("/auth/login")
    ) {
        const cookieHeader = headers.get("Cookie") || "";
        const refreshResult = await tryServerRefresh(cookieHeader);

        if (refreshResult?.ok) {
            // Build a new cookie header by merging refresh cookies
            // with the existing ones (refresh cookies take precedence)
            let updatedCookie = cookieHeader;
            for (const sc of refreshResult.newCookies) {
                // Extract cookie name=value from Set-Cookie header
                const nameVal = sc.split(";")[0]; // "access_token=xyz..."
                const name = nameVal.split("=")[0].trim();
                // Remove old cookie from the combined header
                updatedCookie = updatedCookie
                    .split(";")
                    .map((c) => c.trim())
                    .filter((c) => !c.startsWith(`${name}=`))
                    .join("; ");
                updatedCookie = updatedCookie ? `${updatedCookie}; ${nameVal}` : nameVal;
            }

            const retryHeaders = new Headers(userHeaders);
            retryHeaders.set("Cookie", updatedCookie);

            return fetch(url, { ...rest, headers: retryHeaders, cache: "no-store" });
        }
    }

    return res;
}
