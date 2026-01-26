"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { gatewayFetch } from "@/lib/gateway-client";

export default function EmailTestPage() {
  const [loading, setLoading] = useState(false);
  const [emailType, setEmailType] = useState("booking-confirmation");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSendTestEmail = async () => {
    if (!email) {
      toast.error("Email không được để trống");
      return;
    }

    setLoading(true);

    try {
      const response = await gatewayFetch("/api/test/email", {
        method: "POST",
        body: JSON.stringify({
          type: emailType,
          email,
          name: name || undefined,
        }),
        attachAccessToken: true,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Email đã được gửi thành công!", {
          description: `Email ${emailType} đã được gửi đến ${email}`,
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        });
      } else {
        throw new Error(data.error || "Failed to send email");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Vui lòng kiểm tra cấu hình Resend API";
      console.error("Email test error:", error);
      toast.error("Gửi email thất bại", {
        description: message,
        icon: <XCircle className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Email Testing</h1>
          <p className="text-muted-foreground">
            Test email templates và xác nhận cấu hình Resend API
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Test Email
            </CardTitle>
            <CardDescription>
              Gửi email mẫu để kiểm tra templates và delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="emailType">Email Template</Label>
              <Select value={emailType} onValueChange={setEmailType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại email" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking-confirmation">
                    Xác nhận đặt phòng
                  </SelectItem>
                  <SelectItem value="check-in-reminder">
                    Nhắc nhở check-in
                  </SelectItem>
                  <SelectItem value="cancellation">
                    Xác nhận hủy phòng
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email người nhận *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tên người nhận (tùy chọn)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSendTestEmail}
                disabled={loading || !email}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Gửi Email Test
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Hướng dẫn cấu hình</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Lấy Resend API Key</h3>
              <p className="text-sm text-muted-foreground">
                Truy cập{" "}
                <a
                  href="https://resend.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  resend.com/api-keys
                </a>{" "}
                để tạo API key mới
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Cấu hình .env</h3>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                {`RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@yourdomain.com"`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Verify Domain (Production)</h3>
              <p className="text-sm text-muted-foreground">
                Để gửi email từ domain của bạn, cần verify domain tại Resend dashboard
              </p>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                💡 Trong development, bạn có thể sử dụng{" "}
                <code className="bg-muted px-1 rounded">onboarding@resend.dev</code>{" "}
                làm FROM_EMAIL
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
