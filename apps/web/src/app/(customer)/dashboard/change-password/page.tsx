"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      toast.success("Đổi mật khẩu thành công!");
      
      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect after success
      setTimeout(() => {
        router.push("/dashboard/profile");
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Link
        href="/dashboard/profile"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại hồ sơ
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>
            Cập nhật mật khẩu của bạn để bảo mật tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                <Lock className="inline h-4 w-4 mr-2" />
                Mật khẩu hiện tại
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData({ ...formData, currentPassword: e.target.value })
                }
                placeholder="Nhập mật khẩu hiện tại"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">
                <Lock className="inline h-4 w-4 mr-2" />
                Mật khẩu mới
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                placeholder="Ít nhất 8 ký tự"
                disabled={isLoading}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                <Lock className="inline h-4 w-4 mr-2" />
                Xác nhận mật khẩu mới
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Nhập lại mật khẩu mới"
                disabled={isLoading}
                required
                minLength={8}
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đổi mật khẩu"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
