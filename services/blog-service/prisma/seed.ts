import path from 'node:path';
import { config } from 'dotenv';

config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.BLOG_DATABASE_URL && process.env.DATABASE_URL) {
  process.env.BLOG_DATABASE_URL = process.env.DATABASE_URL;
}

import { PrismaClient } from '../node_modules/.prisma/blog-client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding blog-service...');

  const posts = [
    {
      slug: 'huong-dan-dat-phong',
      title: 'Hướng dẫn đặt phòng khách sạn online',
      excerpt: 'Tìm hiểu cách đặt phòng trực tuyến nhanh chóng và tiện lợi nhất.',
      content: `# Hướng dẫn đặt phòng khách sạn online

## Bước 1: Chọn ngày check-in và check-out
Truy cập trang đặt phòng và chọn ngày nhận phòng cùng ngày trả phòng phù hợp với lịch trình của bạn.

## Bước 2: Chọn loại phòng
Duyệt qua các loại phòng có sẵn, so sánh giá cả và tiện nghi để chọn phòng phù hợp nhất.

## Bước 3: Điền thông tin
Nhập thông tin cá nhân, số lượng khách và yêu cầu đặc biệt nếu có.

## Bước 4: Thanh toán
Hoàn tất thanh toán qua các phương thức hỗ trợ và nhận xác nhận đặt phòng qua email.`,
      status: 'PUBLISHED' as const,
    },
    {
      slug: 'top-5-diem-du-lich',
      title: 'Top 5 điểm du lịch hấp dẫn nhất Việt Nam 2026',
      excerpt: 'Khám phá những điểm đến tuyệt vời cho kỳ nghỉ năm 2026 của bạn.',
      content: `# Top 5 điểm du lịch hấp dẫn nhất Việt Nam 2026

## 1. Đà Nẵng
Thành phố đáng sống với bãi biển Mỹ Khê tuyệt đẹp, cầu Rồng độc đáo và ẩm thực phong phú.

## 2. Phú Quốc
Đảo ngọc với biển xanh cát trắng, hoàng hôn tuyệt đẹp và nhiều resort cao cấp.

## 3. Sapa
Vùng cao tây bắc với ruộng bậc thang kỳ vĩ, văn hóa dân tộc đặc sắc.

## 4. Hội An
Phố cổ quyến rũ với đèn lồng lung linh, ẩm thực đường phố tuyệt hảo.

## 5. Đà Lạt
Thành phố ngàn hoa với khí hậu mát mẻ quanh năm, lý tưởng cho kỳ nghỉ dưỡng.`,
      status: 'PUBLISHED' as const,
    },
    {
      slug: 'meo-tiet-kiem-dat-phong',
      title: 'Mẹo tiết kiệm khi đặt phòng khách sạn',
      excerpt: 'Những bí quyết giúp bạn đặt phòng với giá tốt nhất.',
      content: `# Mẹo tiết kiệm khi đặt phòng khách sạn

## Đặt sớm
Đặt phòng trước ít nhất 2-3 tuần để có giá tốt nhất.

## Chọn ngày giữa tuần
Giá phòng thường rẻ hơn vào thứ 2-5 so với cuối tuần.

## So sánh giá
Sử dụng công cụ tìm kiếm để so sánh giá từ nhiều nguồn khác nhau.

## Đăng ký thành viên
Nhiều khách sạn có chương trình ưu đãi dành riêng cho thành viên.`,
      status: 'DRAFT' as const,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }

  console.log(`Created/updated ${posts.length} blog posts`);
  console.log('blog-service seed complete');
}

main()
  .catch((e) => {
    console.error('Blog seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
