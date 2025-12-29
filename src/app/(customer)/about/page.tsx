import { MainLayout } from "@/components/layout/main-layout";
import { Hotel, Users, Heart, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Về chúng tôi</h1>
          
          <div className="prose max-w-none mb-12">
            <p className="text-lg text-muted-foreground mb-4">
              TravelBook là nền tảng đặt phòng khách sạn hàng đầu, cam kết mang đến 
              trải nghiệm lưu trú tuyệt vời nhất cho mọi khách hàng.
            </p>
            <p className="text-lg text-muted-foreground">
              Với hệ thống đặt phòng hiện đại, thanh toán an toàn và dịch vụ chăm sóc 
              khách hàng 24/7, chúng tôi luôn sẵn sàng phục vụ bạn.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Hotel className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Đa dạng lựa chọn</h3>
                <p className="text-muted-foreground">
                  Hàng trăm phòng với nhiều loại hình và mức giá phù hợp với mọi nhu cầu.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Dịch vụ tận tâm</h3>
                <p className="text-muted-foreground">
                  Đội ngũ nhân viên chuyên nghiệp, nhiệt tình hỗ trợ 24/7.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Heart className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Trải nghiệm tuyệt vời</h3>
                <p className="text-muted-foreground">
                  Cam kết mang đến trải nghiệm lưu trú đáng nhớ và thoải mái nhất.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">An toàn & Bảo mật</h3>
                <p className="text-muted-foreground">
                  Thanh toán an toàn với hệ thống bảo mật hiện đại nhất.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Tầm nhìn và Sứ mệnh</h2>
            <p className="text-muted-foreground mb-4">
              Chúng tôi hướng tới mục tiêu trở thành nền tảng đặt phòng được tin tưởng nhất, 
              nơi mọi người có thể dễ dàng tìm kiếm và đặt phòng cho kỳ nghỉ của mình.
            </p>
            <p className="text-muted-foreground">
              Sứ mệnh của chúng tôi là kết nối khách hàng với những trải nghiệm lưu trú 
              tuyệt vời, đồng thời hỗ trợ các khách sạn phát triển kinh doanh bền vững.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
