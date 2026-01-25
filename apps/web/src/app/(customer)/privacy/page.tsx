import { MainLayout } from "@/components/layout/main-layout";

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Chính sách bảo mật</h1>
          
          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-3">1. Thu thập thông tin</h2>
              <p className="text-muted-foreground">
                Chúng tôi thu thập các thông tin sau khi bạn sử dụng dịch vụ:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Thông tin cá nhân: Họ tên, email, số điện thoại</li>
                <li>Thông tin đặt phòng: Ngày đến, ngày đi, số lượng khách</li>
                <li>Thông tin thanh toán: Thông tin thẻ tín dụng (được mã hóa)</li>
                <li>Thông tin thiết bị: IP, trình duyệt, hệ điều hành</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">2. Sử dụng thông tin</h2>
              <p className="text-muted-foreground">
                Thông tin của bạn được sử dụng để:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Xử lý đặt phòng và thanh toán</li>
                <li>Gửi xác nhận và thông báo quan trọng</li>
                <li>Cải thiện chất lượng dịch vụ</li>
                <li>Gửi thông tin khuyến mãi (nếu bạn đồng ý)</li>
                <li>Phòng chống gian lận</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">3. Bảo mật thông tin</h2>
              <p className="text-muted-foreground mb-2">
                Chúng tôi cam kết bảo vệ thông tin của bạn bằng cách:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Mã hóa SSL/TLS cho mọi giao dịch</li>
                <li>Lưu trữ dữ liệu trên máy chủ bảo mật</li>
                <li>Kiểm tra bảo mật định kỳ</li>
                <li>Giới hạn quyền truy cập nội bộ</li>
                <li>Tuân thủ các tiêu chuẩn bảo mật quốc tế</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">4. Chia sẻ thông tin</h2>
              <p className="text-muted-foreground">
                Chúng tôi chỉ chia sẻ thông tin của bạn với:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Khách sạn liên quan đến đặt phòng của bạn</li>
                <li>Đối tác thanh toán để xử lý giao dịch</li>
                <li>Cơ quan pháp luật khi có yêu cầu hợp pháp</li>
                <li>Không bán hoặc cho thuê thông tin cá nhân</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">5. Quyền của bạn</h2>
              <p className="text-muted-foreground">
                Bạn có quyền:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Truy cập và xem thông tin cá nhân</li>
                <li>Yêu cầu sửa đổi thông tin không chính xác</li>
                <li>Yêu cầu xóa thông tin cá nhân</li>
                <li>Từ chối nhận email marketing</li>
                <li>Khiếu nại về việc xử lý dữ liệu</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">6. Cookies</h2>
              <p className="text-muted-foreground">
                Chúng tôi sử dụng cookies để:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Ghi nhớ đăng nhập của bạn</li>
                <li>Phân tích lưu lượng truy cập</li>
                <li>Cá nhân hóa trải nghiệm</li>
                <li>Bạn có thể tắt cookies trong trình duyệt</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">7. Thay đổi chính sách</h2>
              <p className="text-muted-foreground">
                Chúng tôi có thể cập nhật chính sách này định kỳ. Thay đổi quan trọng 
                sẽ được thông báo qua email hoặc trên website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">8. Liên hệ</h2>
              <p className="text-muted-foreground">
                Nếu bạn có câu hỏi về chính sách bảo mật, liên hệ:
              </p>
              <ul className="list-none text-muted-foreground space-y-1 ml-4">
                <li>Email: privacy@travelbook.com</li>
                <li>Điện thoại: +84 123 456 789</li>
                <li>Địa chỉ: 123 Đường ABC, Quận 1, TP. HCM</li>
              </ul>
            </section>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Cập nhật lần cuối: 28/12/2025
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
