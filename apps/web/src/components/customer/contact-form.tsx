"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Send } from "lucide-react";

export function ContactForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    void new FormData(e.currentTarget);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success("Gửi tin nhắn thành công!", {
      description: "Chúng tôi sẽ phản hồi bạn trong vòng 24h"
    });

    e.currentTarget.reset();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Họ và tên</Label>
          <Input
            id="name"
            name="name"
            placeholder="Nhập họ và tên"
            required
            disabled={loading}
            className="rounded-xl h-11 border-2 focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            required
            disabled={loading}
            className="rounded-xl h-11 border-2 focus:border-primary"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">Số điện thoại</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+84 123 456 789"
            disabled={loading}
            className="rounded-xl h-11 border-2 focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject" className="text-sm font-medium">Chủ đề</Label>
          <Select name="subject" required disabled={loading}>
            <SelectTrigger className="rounded-xl h-11 border-2 focus:border-primary">
              <SelectValue placeholder="Chọn chủ đề" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="booking">Đặt phòng</SelectItem>
              <SelectItem value="complaint">Khiếu nại</SelectItem>
              <SelectItem value="feedback">Góp ý</SelectItem>
              <SelectItem value="partnership">Hợp tác</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-medium">Nội dung</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Nhập nội dung tin nhắn của bạn..."
          rows={5}
          required
          disabled={loading}
          className="rounded-xl border-2 focus:border-primary resize-none"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-gold text-gold-foreground hover:bg-gold/90 font-semibold rounded-xl"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-gold-foreground/30 border-t-gold-foreground rounded-full animate-spin" />
            Đang gửi...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Gửi tin nhắn
          </span>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc
      </p>
    </form>
  );
}
