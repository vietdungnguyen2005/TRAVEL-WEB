"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { gatewayFetch } from "@/lib/gateway-client";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token không hợp lệ");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await gatewayFetch("/api/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Verification failed");
        }

        setStatus("success");
        setMessage("Email đã được xác thực thành công!");
        toast.success("Email verified successfully!");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Xác thực thất bại");
        toast.error(error.message);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
              <CardTitle>Đang xác thực...</CardTitle>
              <CardDescription>Vui lòng đợi trong giây lát</CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Xác thực thành công!</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Xác thực thất bại</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "success" && (
            <p className="text-sm text-center text-muted-foreground">
              Đang chuyển hướng đến trang đăng nhập...
            </p>
          )}

          {status === "error" && (
            <div className="space-y-2">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Quay lại đăng nhập
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
