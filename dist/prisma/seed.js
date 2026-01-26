import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
// Create connection pool and adapter for seed
// Prefer DIRECT_URL for session-mode connections (migrations/seeding) when available.
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (process.env.DIRECT_URL) {
    console.log('Using DIRECT_URL for seeding (preferred for migrations/pooler-unsafe ops)');
}
else {
    console.log('Using DATABASE_URL for seeding');
}
const pool = new Pool({
    connectionString,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
    adapter,
});
async function main() {
    console.log('🌱 Starting seed...');
    // 1. Tạo Admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@travel.com' },
        update: {},
        create: {
            email: 'admin@travel.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
            phone: '0123456789',
        },
    });
    console.log('✅ Created admin user:', admin.email);
    // 2. Tạo Customer user
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: {},
        create: {
            email: 'customer@example.com',
            name: 'John Doe',
            password: customerPassword,
            role: 'CUSTOMER',
            phone: '0987654321',
        },
    });
    console.log('✅ Created customer user:', customer.email);
    // 3. Tạo Room Types
    const deluxeRoom = await prisma.roomType.upsert({
        where: { slug: 'deluxe-room' },
        update: {},
        create: {
            name: 'Deluxe Room',
            slug: 'deluxe-room',
            description: 'Phòng Deluxe sang trọng với view biển tuyệt đẹp, diện tích rộng rãi 35m2, thiết kế hiện đại và đầy đủ tiện nghi cao cấp.',
            pricePerNight: 1500000,
            capacity: 2,
            bedCount: 1,
            size: 35,
            amenities: ['Wifi miễn phí', 'Điều hòa', 'TV 4K', 'Mini Bar', 'Két sắt', 'Bồn tắm', 'View biển'],
            images: [
                'https://images.unsplash.com/photo-1611892440504-42a792e24d32',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
            ],
            featured: true,
            available: true,
        },
    });
    const suiteRoom = await prisma.roomType.upsert({
        where: { slug: 'suite-room' },
        update: {},
        create: {
            name: 'Suite Room',
            slug: 'suite-room',
            description: 'Phòng Suite cao cấp với không gian riêng biệt, phòng khách rộng rãi, phòng ngủ sang trọng. Diện tích 50m2 với đầy đủ tiện nghi 5 sao.',
            pricePerNight: 2500000,
            capacity: 4,
            bedCount: 2,
            size: 50,
            amenities: ['Wifi miễn phí', 'Điều hòa', 'TV 4K', 'Mini Bar', 'Két sắt', 'Bồn tắm Jacuzzi', 'View biển', 'Phòng khách riêng'],
            images: [
                'https://images.unsplash.com/photo-1590490360182-c33d57733427',
                'https://images.unsplash.com/photo-1566665797739-1674de7a421a',
            ],
            featured: true,
            available: true,
        },
    });
    const standardRoom = await prisma.roomType.upsert({
        where: { slug: 'standard-room' },
        update: {},
        create: {
            name: 'Standard Room',
            slug: 'standard-room',
            description: 'Phòng Standard tiện nghi, phù hợp cho khách du lịch tiết kiệm. Diện tích 25m2 với đầy đủ tiện nghi cơ bản.',
            pricePerNight: 800000,
            capacity: 2,
            bedCount: 1,
            size: 25,
            amenities: ['Wifi miễn phí', 'Điều hòa', 'TV', 'Minibar'],
            images: [
                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304',
            ],
            featured: false,
            available: true,
        },
    });
    console.log('✅ Created room types');
    // 4. Tạo Physical Rooms (use upsert to be re-runnable)
    const rooms = [];
    // Deluxe rooms: 201-205
    for (let i = 1; i <= 5; i++) {
        const room = await prisma.room.upsert({
            where: { roomNumber: `20${i}` },
            update: {},
            create: {
                roomNumber: `20${i}`,
                roomTypeId: deluxeRoom.id,
                floor: 2,
                view: 'Sea View',
                status: 'AVAILABLE',
            },
        });
        rooms.push(room);
    }
    // Suite rooms: 301-303
    for (let i = 1; i <= 3; i++) {
        const room = await prisma.room.upsert({
            where: { roomNumber: `30${i}` },
            update: {},
            create: {
                roomNumber: `30${i}`,
                roomTypeId: suiteRoom.id,
                floor: 3,
                view: 'Sea View',
                status: 'AVAILABLE',
            },
        });
        rooms.push(room);
    }
    // Standard rooms: 101-110
    for (let i = 1; i <= 10; i++) {
        const room = await prisma.room.upsert({
            where: { roomNumber: `10${i}` },
            update: {},
            create: {
                roomNumber: `10${i}`,
                roomTypeId: standardRoom.id,
                floor: 1,
                view: 'City View',
                status: 'AVAILABLE',
            },
        });
        rooms.push(room);
    }
    console.log(`✅ Created/Updated ${rooms.length} physical rooms`);
    // 5. Tạo Seasonal Prices (giá cao điểm) - delete old ones first
    await prisma.seasonalPrice.deleteMany({
        where: {
            name: {
                in: [
                    'Tết Nguyên Đán 2026',
                    'Mùa Hè 2026',
                    'Black Friday 2025',
                    'Giáng Sinh 2025',
                    'Năm Mới 2026'
                ]
            }
        }
    });
    const tetPrice = await prisma.seasonalPrice.create({
        data: {
            roomTypeId: deluxeRoom.id,
            name: 'Tết Nguyên Đán 2026',
            startDate: new Date('2026-01-28'),
            endDate: new Date('2026-02-03'),
            pricePerNight: 2500000, // Tăng giá dịp Tết
        },
    });
    const summerPrice = await prisma.seasonalPrice.create({
        data: {
            roomTypeId: suiteRoom.id,
            name: 'Mùa Hè 2026',
            startDate: new Date('2026-06-01'),
            endDate: new Date('2026-08-31'),
            pricePerNight: 4500000, // Cao điểm mùa du lịch
        },
    });
    const blackFridayPrice = await prisma.seasonalPrice.create({
        data: {
            roomTypeId: standardRoom.id,
            name: 'Black Friday 2025',
            startDate: new Date('2025-11-28'),
            endDate: new Date('2025-11-30'),
            pricePerNight: 800000, // Giảm giá kích cầu
        },
    });
    const christmasPrice = await prisma.seasonalPrice.create({
        data: {
            roomTypeId: deluxeRoom.id,
            name: 'Giáng Sinh 2025',
            startDate: new Date('2025-12-23'),
            endDate: new Date('2025-12-26'),
            pricePerNight: 2200000, // Cao điểm lễ
        },
    });
    const newYearPrice = await prisma.seasonalPrice.create({
        data: {
            roomTypeId: suiteRoom.id,
            name: 'Năm Mới 2026',
            startDate: new Date('2025-12-31'),
            endDate: new Date('2026-01-02'),
            pricePerNight: 5000000, // Cao điểm nhất trong năm
        },
    });
    console.log('✅ Created 5 seasonal pricing rules');
    // 6. Tạo Settings
    await prisma.setting.upsert({
        where: { key: 'site_name' },
        update: {},
        create: {
            key: 'site_name',
            value: 'Travel Booking System',
        },
    });
    await prisma.setting.upsert({
        where: { key: 'booking_hold_minutes' },
        update: {},
        create: {
            key: 'booking_hold_minutes',
            value: '15',
        },
    });
    console.log('✅ Created settings');
    console.log('🎉 Seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin@travel.com / admin123');
    console.log('Customer: customer@example.com / customer123');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=seed.js.map