import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isPublicPath(pathname: string) {
    // Public pages
    if (pathname === "/" || pathname.startsWith("/about") || pathname.startsWith("/contact")) return true;
    if (pathname.startsWith("/rooms") || pathname.startsWith("/faq") || pathname.startsWith("/privacy") || pathname.startsWith("/terms")) return true;

    // Auth pages
    if (pathname.startsWith("/auth")) return true;

    // Static/next internals
    if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.startsWith("/public")) return true;

    return false;
}

export function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    // Protect dashboard/admin routes (and any other non-public pages)
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/auth/login";
        loginUrl.search = `?redirect=${encodeURIComponent(pathname + search)}`;
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
