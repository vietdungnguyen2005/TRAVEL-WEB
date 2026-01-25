"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setIsSuccess(true);
      toast.success("Email đặt lại mật khẩu đã được gửi!");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Kiểm tra email của bạn</CardTitle>
            <CardDescription>
              Chúng tôi đã gửi link đặt lại mật khẩu đến <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Link đặt lại mật khẩu sẽ hết hạn sau 1 giờ. Nếu bạn không nhận được email, vui lòng kiểm tra thư mục spam.
              </AlertDescription>
            </Alert>
            <Link href="/auth/login" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại đăng nhập
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Quên mật khẩu?</CardTitle>
          <CardDescription>
            Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi link đặt lại mật khẩu"
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="inline mr-1 h-3 w-3" />
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
