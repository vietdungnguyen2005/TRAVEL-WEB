import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHeroImages() {
  console.log('🌱 Seeding hero images...');

  const heroImages = [
    {
      title: 'Khám Phá Thiên Đường Nghỉ Dưỡng',
      subtitle: 'Trải nghiệm kỳ nghỉ hoàn hảo tại resort 5 sao với view biển tuyệt đẹp',
      imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=600&fit=crop',
      buttonText: 'Đặt Phòng Ngay',
      buttonLink: '/rooms',
      order: 0,
      active: true,
    },
    {
      title: 'Không Gian Sang Trọng & Hiện Đại',
      subtitle: 'Phòng khách sạn đẳng cấp với đầy đủ tiện nghi cao cấp',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=600&fit=crop',
      buttonText: 'Xem Các Phòng',
      buttonLink: '/rooms',
      order: 1,
      active: true,
    },
    {
      title: 'Ưu Đãi Đặc Biệt Cuối Năm',
      subtitle: 'Giảm giá lên đến 30% cho đặt phòng từ 3 đêm trở lên',
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&h=600&fit=crop',
      buttonText: 'Khám Phá Ngay',
      buttonLink: '/rooms',
      order: 2,
      active: true,
    },
  ];

  for (const image of heroImages) {
    const created = await prisma.heroImage.create({
      data: image,
    });
    console.log(`✅ Created hero image: ${created.title}`);
  }

  console.log('🎉 Hero images seeded successfully!');
}

seedHeroImages()
  .catch((e) => {
    console.error('❌ Error seeding hero images:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
