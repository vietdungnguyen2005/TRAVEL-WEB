import { MainLayout } from "@/components/layout/main-layout";

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Điều khoản sử dụng</h1>
          
          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-3">1. Chấp nhận điều khoản</h2>
              <p className="text-muted-foreground">
                Bằng việc truy cập và sử dụng website TravelBook, bạn đồng ý tuân thủ 
                các điều khoản và điều kiện được nêu dưới đây. Nếu bạn không đồng ý với 
                bất kỳ điều khoản nào, vui lòng không sử dụng dịch vụ của chúng tôi.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">2. Đặt phòng và thanh toán</h2>
              <p className="text-muted-foreground mb-2">
                Khi thực hiện đặt phòng trên TravelBook, bạn cam kết:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Cung cấp thông tin chính xác và đầy đủ</li>
                <li>Thanh toán đầy đủ theo giá trị đặt phòng</li>
                <li>Tuân thủ các quy định của khách sạn</li>
                <li>Chịu trách nhiệm về việc sử dụng phòng</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">3. Chính sách hủy phòng</h2>
              <p className="text-muted-foreground">
                Chính sách hủy phòng được áp dụng như sau:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Hủy trước 24 giờ: Hoàn tiền 100%</li>
                <li>Hủy trong vòng 24 giờ: Hoàn tiền 50%</li>
                <li>Không đến không báo: Không hoàn tiền</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">4. Trách nhiệm của khách hàng</h2>
              <p className="text-muted-foreground">
                Khách hàng có trách nhiệm:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Bảo mật thông tin tài khoản</li>
                <li>Tuân thủ quy định của khách sạn</li>
                <li>Bồi thường thiệt hại (nếu có)</li>
                <li>Tôn trọng tài sản và nhân viên</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">5. Giới hạn trách nhiệm</h2>
              <p className="text-muted-foreground">
                TravelBook không chịu trách nhiệm về:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Thiệt hại gián tiếp hoặc ngẫu nhiên</li>
                <li>Mất mát dữ liệu hoặc lợi nhuận</li>
                <li>Gián đoạn dịch vụ do lỗi kỹ thuật</li>
                <li>Hành vi của bên thứ ba</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">6. Thay đổi điều khoản</h2>
              <p className="text-muted-foreground">
                TravelBook có quyền thay đổi các điều khoản này bất kỳ lúc nào. 
                Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với 
                việc bạn chấp nhận các điều khoản mới.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">7. Liên hệ</h2>
              <p className="text-muted-foreground">
                Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ:
              </p>
              <ul className="list-none text-muted-foreground space-y-1 ml-4">
                <li>Email: legal@travelbook.com</li>
                <li>Điện thoại: +84 123 456 789</li>
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
