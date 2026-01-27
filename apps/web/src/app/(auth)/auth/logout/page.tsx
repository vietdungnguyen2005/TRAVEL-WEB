"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function clearCookie(name: string) {
    // Clear for common paths; keep it simple.
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        clearCookie("access_token");
        toast.success("Đã đăng xuất");
        router.replace("/auth/login");
        router.refresh();
    }, [router]);

    return null;
}
