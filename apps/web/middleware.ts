import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Paths that do NOT require an access_token cookie. */
const PUBLIC_PREFIXES = [
    "/",          // homepage (exact)
    "/about",
    "/contact",
    "/rooms",
    "/faq",
    "/privacy",
    "/terms",
    "/blog",      // blog is public content
    "/auth",      // login / register / forgot-password
    "/_next",
    "/favicon",
    "/public",
    "/api",       // Next.js API routes handle their own auth
];

function isPublicPath(pathname: string) {
    if (pathname === "/") return true;
    return PUBLIC_PREFIXES.some(
        (prefix) => prefix !== "/" && pathname.startsWith(prefix),
    );
}

export function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    // Protect dashboard/admin routes (and any other non-public pages)
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
        const redirectTo = encodeURIComponent(pathname + search);
        const loginUrl = new URL(`/auth/login?redirect=${redirectTo}`, req.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Run on all pages except static assets
        "/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$).*)",
    ],
};
