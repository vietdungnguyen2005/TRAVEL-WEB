"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function clearCookie(name: string) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        let done = false;
        (async () => {
            try {
                // Call server-side logout route to clear httpOnly cookies
                // and revoke the refresh token in the auth-service DB.
                await fetch("/api/auth/logout", { method: "POST" });
            } catch {
                // Gateway/server may be down — still clear client cookies
            }
            // Fallback: clear non-httpOnly cookies from JS
            clearCookie("access_token");
            clearCookie("refresh_token");

            if (!done) {
                done = true;
                toast.success("Đã đăng xuất");
                router.replace("/auth/login");
                router.refresh();
            }
        })();
    }, [router]);

    return null;
}
