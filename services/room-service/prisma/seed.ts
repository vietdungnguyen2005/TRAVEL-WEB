import { PrismaClient } from '../node_modules/.prisma/room-client';

const prisma = new PrismaClient();

async function main() {
    // ========================================================================
    // ROOM TYPES – Vietnamese hotel/resort categories with VND pricing
    // ========================================================================

    const roomTypesData = [
        // --- Standard & Classic ---
        {
            id: 'seed-standard',
            name: 'Standard',
            description:
                'Phòng tiêu chuẩn ấm cúng, đầy đủ tiện nghi cơ bản cho một kỳ nghỉ thoải mái. Phù hợp cho khách du lịch cá nhân hoặc cặp đôi muốn trải nghiệm với mức giá hợp lý.',
            basePrice: 800000,
            maxGuests: 2,
            location: 'Hà Nội',
            amenities: ['Wifi miễn phí', 'TV màn hình phẳng', 'Điều hòa', 'Minibar', 'Két an toàn'],
            images: [
                'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80',
            ],
        },
        {
            id: 'seed-superior',
            name: 'Superior',
            description:
                'Phòng Superior rộng rãi hơn với nội thất sang trọng, view đẹp ra thành phố hoặc vườn. Lý tưởng cho cặp đôi muốn không gian riêng tư và thoải mái.',
            basePrice: 1200000,
            maxGuests: 2,
            location: 'TP. Hồ Chí Minh',
            amenities: ['Wifi miễn phí', 'TV 50 inch', 'Điều hòa', 'Minibar', 'Két an toàn', 'Bồn tắm', 'Áo choàng tắm'],
            images: [
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
            ],
        },
        // --- Deluxe ---
        {
            id: 'seed-deluxe',
            name: 'Deluxe',
            description:
                'Phòng Deluxe cao cấp với thiết kế hiện đại, tầm nhìn tuyệt đẹp ra biển hoặc núi. Trang bị đầy đủ tiện nghi 5 sao, bao gồm bồn tắm jacuzzi và ban công riêng.',
            basePrice: 1800000,
            maxGuests: 2,
            location: 'Đà Nẵng',
            amenities: ['Wifi miễn phí', 'TV 55 inch', 'Điều hòa', 'Minibar đầy đủ', 'Két an toàn', 'Bồn tắm Jacuzzi', 'Ban công riêng', 'Máy pha cà phê'],
            images: [
                'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
            ],
        },
        {
            id: 'seed-deluxe-ocean',
            name: 'Deluxe Ocean View',
            description:
                'Phòng Deluxe hướng biển tuyệt đẹp tại Đà Nẵng – Hội An. Thức dậy mỗi sáng với âm thanh sóng biển và tầm nhìn bao la ra Biển Đông. Thiết kế kết hợp phong cách Á Đông và hiện đại.',
            basePrice: 2500000,
            maxGuests: 2,
            location: 'Đà Nẵng',
            amenities: ['Wifi miễn phí', 'TV 55 inch', 'Điều hòa', 'Minibar', 'View biển trực diện', 'Ban công', 'Bồn tắm', 'Dép đi biển', 'Khăn beach'],
            images: [
                'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
            ],
        },
        // --- Suite ---
        {
            id: 'seed-suite',
            name: 'Suite',
            description:
                'Suite sang trọng với phòng khách riêng biệt và phòng ngủ rộng rãi. Nội thất cao cấp cùng dịch vụ phòng 24/7. Phù hợp cho gia đình nhỏ hoặc cặp đôi muốn trải nghiệm đẳng cấp.',
            basePrice: 3500000,
            maxGuests: 4,
            location: 'Huế',
            amenities: ['Wifi miễn phí', 'TV 65 inch', 'Điều hòa', 'Minibar cao cấp', 'Két an toàn', 'Bồn tắm Jacuzzi', 'Phòng khách riêng', 'Ban công rộng', 'Máy pha cà phê Nespresso', 'Dịch vụ phòng 24/7'],
            images: [
                'https://images.unsplash.com/photo-1505691723518-36a5ac3b2a57?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
            ],
        },
        {
            id: 'seed-executive-suite',
            name: 'Executive Suite',
            description:
                'Executive Suite dành cho khách doanh nhân và VIP. Không gian làm việc tiện nghi, phòng họp nhỏ riêng biệt, và lounge riêng. Tọa lạc tại tầng cao với view panorama thành phố.',
            basePrice: 5000000,
            maxGuests: 3,
            location: 'TP. Hồ Chí Minh',
            amenities: ['Wifi tốc độ cao', 'TV 70 inch', 'Điều hòa', 'Mini bar premium', 'Két an toàn lớn', 'Bồn tắm Jacuzzi', 'Phòng khách & phòng làm việc riêng', 'Executive Lounge', 'Butler service', 'Bữa sáng buffet'],
            images: [
                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80',
            ],
        },
        // --- Family ---
        {
            id: 'seed-family',
            name: 'Family Room',
            description:
                'Phòng gia đình rộng rãi với 2 giường đôi, khu vui chơi cho trẻ nhỏ. Thiết kế an toàn và tiện nghi cho cả gia đình. Gần khu vực hồ bơi và sân chơi trẻ em.',
            basePrice: 2200000,
            maxGuests: 4,
            location: 'Vũng Tàu',
            amenities: ['Wifi miễn phí', 'TV 55 inch', 'Điều hòa', 'Minibar', '2 giường đôi', 'Bồn tắm & vòi sen', 'Khu vui chơi trẻ em', 'Két an toàn', 'Ghế trẻ em'],
            images: [
                'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1200&q=80',
            ],
        },
        {
            id: 'seed-family-suite',
            name: 'Family Suite',
            description:
                'Suite gia đình 2 phòng ngủ liền kề với phòng khách chung. Hoàn hảo cho gia đình lớn hoặc nhóm bạn. Bao gồm bếp nhỏ và ban công rộng nhìn ra vườn nhiệt đới.',
            basePrice: 4000000,
            maxGuests: 6,
            location: 'Quy Nhơn',
            amenities: ['Wifi miễn phí', '2 TV', 'Điều hòa', 'Minibar', '2 phòng ngủ', 'Phòng khách', 'Bếp nhỏ', 'Ban công', 'Máy giặt', 'Két an toàn'],
            images: [
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
            ],
        },
        // --- Villa & Premium ---
        {
            id: 'seed-pool-villa',
            name: 'Pool Villa',
            description:
                'Biệt thự riêng với hồ bơi vô cực nhìn ra biển tại Phú Quốc. Không gian sống hoàn toàn riêng tư giữa khu vườn nhiệt đới xanh mát. Trải nghiệm nghỉ dưỡng 5 sao đẳng cấp quốc tế.',
            basePrice: 8000000,
            maxGuests: 4,
            location: 'Phú Quốc',
            amenities: ['Wifi miễn phí', 'TV 75 inch', 'Điều hòa', 'Minibar cao cấp', 'Hồ bơi riêng', 'Vườn riêng', 'Bồn tắm ngoài trời', 'BBQ area', 'Butler 24/7', 'Xe đưa đón'],
            images: [
                'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
            ],
        },
        {
            id: 'seed-presidential-suite',
            name: 'Presidential Suite',
            description:
                'Presidential Suite – đỉnh cao của sự xa hoa. Tọa lạc tại tầng cao nhất với tầm nhìn 360 độ ra vịnh Hạ Long. Phòng ăn riêng, phòng spa riêng, và dịch vụ butler chuyên biệt.',
            basePrice: 15000000,
            maxGuests: 4,
            location: 'Hạ Long',
            amenities: ['Wifi tốc độ cao', 'TV 85 inch', 'Điều hòa', 'Wine cellar riêng', 'Phòng ăn riêng', 'Phòng spa riêng', 'Phòng khách VIP', 'Sân thượng panorama', 'Butler riêng 24/7', 'Xe limousine đưa đón', 'Bữa sáng tại phòng'],
            images: [
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
            ],
        },
        // --- Boutique & Themed ---
        {
            id: 'seed-sapa-mountain',
            name: 'Mountain View - Sapa',
            description:
                'Phòng view núi tuyệt đẹp giữa lòng Sapa. Thức dậy giữa mây mù và ruộng bậc thang Mù Cang Chải. Nội thất gỗ truyền thống kết hợp tiện nghi hiện đại, lò sưởi ấm áp mùa đông.',
            basePrice: 1500000,
            maxGuests: 2,
            location: 'Sa Pa',
            amenities: ['Wifi miễn phí', 'TV', 'Lò sưởi', 'Minibar', 'Ban công view núi', 'Bồn tắm gỗ', 'Trà địa phương', 'Chăn lông vũ'],
            images: [
                'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1586611292717-f828b167408c?auto=format&fit=crop&w=1200&q=80',
            ],
        },
        {
            id: 'seed-dalat-romance',
            name: 'Romance Suite - Đà Lạt',
            description:
                'Suite lãng mạn tại thành phố ngàn hoa Đà Lạt. View trực diện ra hồ Xuân Hương, nội thất phong cách Pháp cổ điển. Hoàn hảo cho tuần trăng mật và kỷ niệm đặc biệt.',
            basePrice: 2800000,
            maxGuests: 2,
            location: 'Đà Lạt',
            amenities: ['Wifi miễn phí', 'TV 55 inch', 'Lò sưởi', 'Minibar rượu vang', 'View hồ Xuân Hương', 'Bồn tắm đôi', 'Ban công hoa', 'Bữa sáng tại phòng', 'Hoa tươi trang trí'],
            images: [
                'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
            ],
        },
        {
            id: 'seed-hoian-heritage',
            name: 'Heritage Room - Hội An',
            description:
                'Phòng phong cách di sản Hội An với kiến trúc nhà cổ truyền thống. Đèn lồng, gỗ lim và gạch Bát Tràng hòa quyện cùng tiện nghi 4 sao. Nằm ngay trung tâm phố cổ.',
            basePrice: 1600000,
            maxGuests: 2,
            location: 'Hội An',
            amenities: ['Wifi miễn phí', 'TV', 'Điều hòa', 'Minibar', 'Kiến trúc cổ', 'Sân vườn', 'Xe đạp miễn phí', 'Trà sen Hội An'],
            images: [
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1559599238-308793637427?auto=format&fit=crop&w=1200&q=80',
            ],
        },
        {
            id: 'seed-nhatrang-beach',
            name: 'Beachfront Room - Nha Trang',
            description:
                'Phòng ngay sát bãi biển Nha Trang tuyệt đẹp. Chỉ vài bước chân là tới bãi cát trắng mịn và làn nước trong xanh. Thiết kế hiện đại với tông màu biển.',
            basePrice: 2000000,
            maxGuests: 3,
            location: 'Nha Trang',
            amenities: ['Wifi miễn phí', 'TV 55 inch', 'Điều hòa', 'Minibar', 'View biển', 'Ban công', 'Bồn tắm', 'Dụng cụ lặn biển', 'Kem chống nắng'],
            images: [
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80',
            ],
        },
        {
            id: 'seed-phuquoc-bungalow',
            name: 'Beach Bungalow - Phú Quốc',
            description:
                'Bungalow ven biển Phú Quốc xinh đẹp với mái lá và sàn gỗ. Ngồi trước hiên ngắm hoàng hôn trên biển, nghe sóng vỗ nhẹ. Cách biển chỉ 10m – trải nghiệm Robinson thời hiện đại.',
            basePrice: 3000000,
            maxGuests: 2,
            location: 'Phú Quốc',
            amenities: ['Wifi miễn phí', 'TV', 'Điều hòa', 'Minibar', 'Sát biển', 'Hiên riêng', 'Võng', 'BBQ ngoài trời', 'Kayak miễn phí'],
            images: [
                'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80',
            ],
        },
        {
            id: 'seed-halong-cruise',
            name: 'Cruise Cabin - Hạ Long',
            description:
                'Cabin sang trọng trên du thuyền 5 sao vịnh Hạ Long. Lênh đênh giữa hàng ngàn đảo đá vôi kỳ vĩ, tận hưởng ẩm thực hải sản tươi sống và hoạt động giải trí trên thuyền.',
            basePrice: 4500000,
            maxGuests: 2,
            location: 'Hạ Long',
            amenities: ['Wifi', 'TV', 'Điều hòa', 'Minibar', 'View vịnh', 'Ban công riêng', 'Bữa ăn trọn gói', 'Chèo kayak', 'Câu mực đêm', 'Taichi buổi sáng'],
            images: [
                'https://images.unsplash.com/photo-1559628233-100c798642d4?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80',
            ],
        },
    ];

    // Upsert all room types
    for (const rt of roomTypesData) {
        await prisma.roomType.upsert({
            where: { id: rt.id },
            update: {
                name: rt.name,
                description: rt.description,
                basePrice: rt.basePrice,
                maxGuests: rt.maxGuests,
                location: rt.location,
                amenities: rt.amenities,
                images: rt.images,
                isActive: true,
            },
            create: {
                id: rt.id,
                name: rt.name,
                description: rt.description,
                basePrice: rt.basePrice,
                maxGuests: rt.maxGuests,
                location: rt.location,
                amenities: rt.amenities,
                images: rt.images,
                isActive: true,
            },
        });
    }

    // ========================================================================
    // ROOMS – Multiple rooms per type across floors
    // ========================================================================

    const roomsData = [
        // Standard – floor 1
        { roomNumber: '101', roomTypeId: 'seed-standard', floor: 1 },
        { roomNumber: '102', roomTypeId: 'seed-standard', floor: 1 },
        { roomNumber: '103', roomTypeId: 'seed-standard', floor: 1 },
        { roomNumber: '104', roomTypeId: 'seed-standard', floor: 1 },

        // Superior – floor 2
        { roomNumber: '201', roomTypeId: 'seed-superior', floor: 2 },
        { roomNumber: '202', roomTypeId: 'seed-superior', floor: 2 },
        { roomNumber: '203', roomTypeId: 'seed-superior', floor: 2 },

        // Deluxe – floor 3
        { roomNumber: '301', roomTypeId: 'seed-deluxe', floor: 3 },
        { roomNumber: '302', roomTypeId: 'seed-deluxe', floor: 3 },
        { roomNumber: '303', roomTypeId: 'seed-deluxe', floor: 3 },

        // Deluxe Ocean View – floor 4
        { roomNumber: '401', roomTypeId: 'seed-deluxe-ocean', floor: 4 },
        { roomNumber: '402', roomTypeId: 'seed-deluxe-ocean', floor: 4 },

        // Suite – floor 5
        { roomNumber: '501', roomTypeId: 'seed-suite', floor: 5 },
        { roomNumber: '502', roomTypeId: 'seed-suite', floor: 5 },

        // Executive Suite – floor 6
        { roomNumber: '601', roomTypeId: 'seed-executive-suite', floor: 6 },
        { roomNumber: '602', roomTypeId: 'seed-executive-suite', floor: 6 },

        // Family Room – floor 2
        { roomNumber: '204', roomTypeId: 'seed-family', floor: 2 },
        { roomNumber: '205', roomTypeId: 'seed-family', floor: 2 },
        { roomNumber: '206', roomTypeId: 'seed-family', floor: 2 },

        // Family Suite – floor 3
        { roomNumber: '304', roomTypeId: 'seed-family-suite', floor: 3 },
        { roomNumber: '305', roomTypeId: 'seed-family-suite', floor: 3 },

        // Pool Villa
        { roomNumber: 'V01', roomTypeId: 'seed-pool-villa', floor: 1 },
        { roomNumber: 'V02', roomTypeId: 'seed-pool-villa', floor: 1 },
        { roomNumber: 'V03', roomTypeId: 'seed-pool-villa', floor: 1 },

        // Presidential Suite – penthouse
        { roomNumber: 'P01', roomTypeId: 'seed-presidential-suite', floor: 10 },

        // Sapa Mountain View
        { roomNumber: 'SP01', roomTypeId: 'seed-sapa-mountain', floor: 1 },
        { roomNumber: 'SP02', roomTypeId: 'seed-sapa-mountain', floor: 1 },
        { roomNumber: 'SP03', roomTypeId: 'seed-sapa-mountain', floor: 2 },

        // Đà Lạt Romance
        { roomNumber: 'DL01', roomTypeId: 'seed-dalat-romance', floor: 1 },
        { roomNumber: 'DL02', roomTypeId: 'seed-dalat-romance', floor: 2 },

        // Hội An Heritage
        { roomNumber: 'HA01', roomTypeId: 'seed-hoian-heritage', floor: 1 },
        { roomNumber: 'HA02', roomTypeId: 'seed-hoian-heritage', floor: 1 },
        { roomNumber: 'HA03', roomTypeId: 'seed-hoian-heritage', floor: 2 },

        // Nha Trang Beachfront
        { roomNumber: 'NT01', roomTypeId: 'seed-nhatrang-beach', floor: 1 },
        { roomNumber: 'NT02', roomTypeId: 'seed-nhatrang-beach', floor: 2 },
        { roomNumber: 'NT03', roomTypeId: 'seed-nhatrang-beach', floor: 3 },

        // Phú Quốc Bungalow
        { roomNumber: 'PQ01', roomTypeId: 'seed-phuquoc-bungalow', floor: 1 },
        { roomNumber: 'PQ02', roomTypeId: 'seed-phuquoc-bungalow', floor: 1 },
        { roomNumber: 'PQ03', roomTypeId: 'seed-phuquoc-bungalow', floor: 1 },
        { roomNumber: 'PQ04', roomTypeId: 'seed-phuquoc-bungalow', floor: 1 },

        // Hạ Long Cruise Cabin
        { roomNumber: 'HL01', roomTypeId: 'seed-halong-cruise', floor: 1 },
        { roomNumber: 'HL02', roomTypeId: 'seed-halong-cruise', floor: 1 },
        { roomNumber: 'HL03', roomTypeId: 'seed-halong-cruise', floor: 2 },
        { roomNumber: 'HL04', roomTypeId: 'seed-halong-cruise', floor: 2 },
    ];

    for (const r of roomsData) {
        await prisma.room.upsert({
            where: { roomNumber: r.roomNumber },
            update: {
                roomTypeId: r.roomTypeId,
                floor: r.floor,
                status: 'AVAILABLE',
            },
            create: {
                roomNumber: r.roomNumber,
                roomTypeId: r.roomTypeId,
                floor: r.floor,
                status: 'AVAILABLE',
            },
        });
    }

    console.log(`Seeded ${roomTypesData.length} room types and ${roomsData.length} rooms.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
        console.log('room-service seed complete');
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
