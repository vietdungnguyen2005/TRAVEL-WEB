"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ContactForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success("Gửi tin nhắn thành công!", {
      description: "Chúng tôi sẽ phản hồi bạn trong vòng 24h"
    });

    // Reset form
    e.currentTarget.reset();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Họ và tên</Label>
        <Input 
          id="name" 
          name="name" 
          placeholder="Nhập họ và tên của bạn" 
          required 
          disabled={loading} 
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          placeholder="your@email.com" 
          required 
          disabled={loading} 
        />
      </div>

      <div>
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input 
          id="phone" 
          name="phone" 
          type="tel" 
          placeholder="+84 123 456 789" 
          disabled={loading} 
        />
      </div>

      <div>
        <Label htmlFor="subject">Chủ đề</Label>
        <Input 
          id="subject" 
          name="subject" 
          placeholder="Chủ đề tin nhắn" 
          required 
          disabled={loading} 
        />
      </div>

      <div>
        <Label htmlFor="message">Nội dung</Label>
        <Textarea 
          id="message"
          name="message" 
          placeholder="Nhập nội dung tin nhắn của bạn..." 
          rows={5}
          required
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Đang gửi..." : "Gửi tin nhắn"}
      </Button>
    </form>
  );
}
