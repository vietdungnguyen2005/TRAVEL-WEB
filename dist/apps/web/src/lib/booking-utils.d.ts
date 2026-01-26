/**
 * Kiểm tra phòng trống trong khoảng thời gian
 * Logic: Phòng được coi là TRỐNG nếu KHÔNG có booking nào mà:
 * - Trạng thái là CONFIRMED hoặc ON_HOLD
 * - Và khoảng thời gian [checkIn, checkOut) giao nhau với [existingCheckIn, existingCheckOut)
 */
export declare function checkRoomAvailability(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean>;
/**
 * Tìm tất cả phòng trống theo loại phòng trong khoảng thời gian
 */
export declare function findAvailableRooms(roomTypeId: string, checkIn: Date, checkOut: Date): Promise<any>;
/**
 * Tính giá phòng theo ngày với seasonal pricing
 */
export declare function calculateTotalPrice(roomTypeId: string, checkIn: Date, checkOut: Date): Promise<number>;
export declare function calculateTotalPriceCompat(checkIn: Date, checkOut: Date, basePrice: number, seasonalPrices: Array<{
    startDate: Date;
    endDate: Date;
    pricePerNight: number;
}>): number;
export declare function isDateRangeAvailable(checkIn: Date, checkOut: Date, bookings: Array<{
    checkIn: Date;
    checkOut: Date;
}>): boolean;
/**
 * Tạo booking với trạng thái ON_HOLD (giữ chỗ tạm thời 15 phút)
 */
export declare function createHoldBooking(userId: string, roomId: string, checkIn: Date, checkOut: Date, numberOfGuests: number, totalPrice: number): Promise<any>;
/**
 * Xóa các booking ON_HOLD đã hết hạn
 */
export declare function cleanupExpiredHolds(): Promise<void>;
//# sourceMappingURL=booking-utils.d.ts.map