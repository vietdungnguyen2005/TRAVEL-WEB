"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function safeRedirect(target: string | null) {
    if (!target) return "/dashboard";
    // Only allow relative redirects.
    if (!target.startsWith("/")) return "/dashboard";
    if (target.startsWith("//")) return "/dashboard";
    return target;
}

function OAuthCallbackInner() {
    const router = useRouter();
    const params = useSearchParams();

    useEffect(() => {
        const token = params.get("token");
        const redirect = safeRedirect(params.get("redirect"));

        if (!token) {
            router.replace(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
            return;
        }

        // Store token on the web origin so client-side calls can attach it.
        // Note: keep SameSite=Lax so regular navigation keeps it; no Domain set.
        document.cookie = `access_token=${encodeURIComponent(token)}; Path=/; Max-Age=900; SameSite=Lax`;

        // Store refresh token if provided (for OAuth session persistence)
        const refreshToken = params.get("refreshToken");
        if (refreshToken) {
            document.cookie = `refresh_token=${encodeURIComponent(refreshToken)}; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax`;
        }

        // Navigate away ASAP so token isn't left in the address bar.
        router.replace(redirect);
    }, [params, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Signing you in…</p>
        </div>
    );
}

export default function OAuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Signing you in…</p>
                </div>
            }
        >
            <OAuthCallbackInner />
        </Suspense>
    );
}
