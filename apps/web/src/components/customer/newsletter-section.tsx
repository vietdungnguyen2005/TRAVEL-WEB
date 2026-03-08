"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success("Đăng ký thành công! Cảm ơn bạn đã quan tâm.");
    setEmail("");
    setIsLoading(false);
  };

  return (
    <section className="relative py-20 bg-primary overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 mb-6">
            <Mail className="h-8 w-8 text-gold" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Nhận ưu đãi độc quyền
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Đăng ký nhận thông tin về ưu đãi và khuyến mãi mới nhất từ TravelBook.
            Giảm ngay <span className="text-gold font-semibold">10%</span> cho lần đặt phòng đầu tiên!
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-white/15 border-white/25 text-white placeholder:text-white/50 focus:border-gold focus:ring-gold/30 h-12"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gold text-gold-foreground hover:bg-gold/90 shadow-lg h-12 px-8 font-semibold"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-gold-foreground/30 border-t-gold-foreground rounded-full animate-spin" />
                  Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Đăng ký
                </span>
              )}
            </Button>
          </form>

          <p className="text-white/40 text-xs mt-4">
            Chúng tôi tôn trọng quyền riêng tư của bạn. Bạn có thể hủy đăng ký bất kỳ lúc nào.
          </p>
        </div>
      </div>
    </section>
  );
}
