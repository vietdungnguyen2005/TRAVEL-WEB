/**
 * Kiểm tra phòng trống trong khoảng thời gian
 * Logic: Phòng được coi là TRỐNG nếu KHÔNG có booking nào mà:
 * - Trạng thái là CONFIRMED hoặc ON_HOLD
 * - Và khoảng thời gian [checkIn, checkOut) giao nhau với [existingCheckIn, existingCheckOut)
 */
import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";
export async function checkRoomAvailability(roomId, checkIn, checkOut) {
    const conflictingBookings = await prisma.booking.findMany({
        where: {
            roomId,
            status: {
                in: ["CONFIRMED", "ON_HOLD"],
            },
            OR: [
                {
                    // Case 1: Booking hiện tại bắt đầu trong khoảng thời gian đặt mới
                    checkIn: {
                        gte: checkIn,
                        lt: checkOut,
                    },
                },
                {
                    // Case 2: Booking hiện tại kết thúc trong khoảng thời gian đặt mới
                    checkOut: {
                        gt: checkIn,
                        lte: checkOut,
                    },
                },
                {
                    // Case 3: Booking hiện tại bao trùm hoàn toàn khoảng thời gian đặt mới
                    AND: [
                        {
                            checkIn: {
                                lte: checkIn,
                            },
                        },
                        {
                            checkOut: {
                                gte: checkOut,
                            },
                        },
                    ],
                },
            ],
        },
    });
    return conflictingBookings.length === 0;
}
/**
 * Tìm tất cả phòng trống theo loại phòng trong khoảng thời gian
 */
export async function findAvailableRooms(roomTypeId, checkIn, checkOut) {
    // Lấy tất cả phòng thuộc loại này
    const allRooms = await prisma.room.findMany({
        where: {
            roomTypeId,
            status: "AVAILABLE", // Chỉ lấy phòng không đang bảo trì
        },
        include: {
            roomType: true,
            bookings: {
                where: {
                    status: {
                        in: ["CONFIRMED", "ON_HOLD"],
                    },
                    OR: [
                        {
                            checkIn: {
                                gte: checkIn,
                                lt: checkOut,
                            },
                        },
                        {
                            checkOut: {
                                gt: checkIn,
                                lte: checkOut,
                            },
                        },
                        {
                            AND: [
                                {
                                    checkIn: {
                                        lte: checkIn,
                                    },
                                },
                                {
                                    checkOut: {
                                        gte: checkOut,
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        },
    });
    // Filter ra các phòng không có booking trùng
    return allRooms.filter((room) => room.bookings.length === 0);
}
/**
 * Tính giá phòng theo ngày với seasonal pricing
 */
export async function calculateTotalPrice(roomTypeId, checkIn, checkOut) {
    const roomType = await prisma.roomType.findUnique({
        where: { id: roomTypeId },
        include: {
            seasonalPrices: {
                where: {
                    AND: [
                        {
                            startDate: {
                                lte: checkOut,
                            },
                        },
                        {
                            endDate: {
                                gte: checkIn,
                            },
                        },
                    ],
                },
                orderBy: {
                    pricePerNight: 'desc', // Get highest price if multiple seasons overlap
                },
            },
        },
    });
    if (!roomType)
        throw new Error("Room type not found");
    const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    // If there are seasonal prices, use them
    if (roomType.seasonalPrices && roomType.seasonalPrices.length > 0) {
        let totalPrice = 0;
        const currentDate = new Date(checkIn);
        // Calculate price for each night
        while (currentDate < checkOut) {
            const nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + 1);
            // Find applicable seasonal price for this date
            const applicableSeasonalPrice = roomType.seasonalPrices.find((sp) => new Date(sp.startDate) <= currentDate &&
                new Date(sp.endDate) >= currentDate);
            // Use seasonal price if available, otherwise use base price
            const priceForNight = applicableSeasonalPrice
                ? Number(applicableSeasonalPrice.pricePerNight)
                : Number(roomType.pricePerNight);
            totalPrice += priceForNight;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return totalPrice;
    }
    // No seasonal pricing, use base price
    const basePrice = Number(roomType.pricePerNight);
    return basePrice * numberOfNights;
}
// Compatibility: pure helpers used by unit tests in this repo.
// Old signature: calculateTotalPrice(checkIn, checkOut, basePrice, seasonalPrices)
export function calculateTotalPriceCompat(checkIn, checkOut, basePrice, seasonalPrices) {
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    let total = 0;
    const current = new Date(checkIn);
    while (current < checkOut) {
        const applicable = seasonalPrices.find((sp) => sp.startDate <= current && sp.endDate >= current);
        total += applicable ? applicable.pricePerNight : basePrice;
        current.setDate(current.getDate() + 1);
    }
    return total;
}
export function isDateRangeAvailable(checkIn, checkOut, bookings) {
    for (const b of bookings) {
        // Overlap exists if start < existingEnd and existingStart < end
        if (checkIn < b.checkOut && b.checkIn < checkOut)
            return false;
    }
    return true;
}
/**
 * Tạo booking với trạng thái ON_HOLD (giữ chỗ tạm thời 15 phút)
 */
export async function createHoldBooking(userId, roomId, checkIn, checkOut, numberOfGuests, totalPrice) {
    const holdExpiresAt = addDays(new Date(), 0); // 15 minutes from now
    holdExpiresAt.setMinutes(holdExpiresAt.getMinutes() + 15);
    return await prisma.booking.create({
        data: {
            userId,
            roomId,
            checkIn,
            checkOut,
            numberOfGuests,
            totalPrice,
            status: "ON_HOLD",
            holdExpiresAt,
        },
    });
}
/**
 * Xóa các booking ON_HOLD đã hết hạn
 */
export async function cleanupExpiredHolds() {
    await prisma.booking.deleteMany({
        where: {
            status: "ON_HOLD",
            holdExpiresAt: {
                lt: new Date(),
            },
        },
    });
}
//# sourceMappingURL=booking-utils.js.map