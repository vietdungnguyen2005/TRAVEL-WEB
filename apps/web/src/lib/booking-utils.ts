/**
 * Kiểm tra phòng trống trong khoảng thời gian
 * Logic: Phòng được coi là TRỐNG nếu KHÔNG có booking nào mà:
 * - Trạng thái là CONFIRMED hoặc ON_HOLD
 * - Và khoảng thời gian [checkIn, checkOut) giao nhau với [existingCheckIn, existingCheckOut)
 */

// Note: date-fns imports were removed; UI-only web uses gateway endpoints for availability/pricing.

export async function checkRoomAvailability(
  roomId: string,
  checkIn: Date,
  checkOut: Date
): Promise<boolean> {
  void roomId;
  void checkIn;
  void checkOut;
  // UI-only web app: availability must be checked via booking-service through the API gateway.
  // Keep function as a guard to avoid silent incorrect logic.
  throw new Error(
    "checkRoomAvailability() is not available in UI-only web. Use gateway endpoint /api/booking/check-availability."
  );
}

/**
 * Tìm tất cả phòng trống theo loại phòng trong khoảng thời gian
 */
export async function findAvailableRooms(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date
) {
  void roomTypeId;
  void checkIn;
  void checkOut;
  throw new Error(
    "findAvailableRooms() is not available in UI-only web. Use gateway endpoint /api/rooms/availability."
  );
}

/**
 * Tính giá phòng theo ngày với seasonal pricing
 */
export async function calculateTotalPrice(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date
): Promise<number> {
  void roomTypeId;
  void checkIn;
  void checkOut;
  throw new Error(
    "calculateTotalPrice(roomTypeId, checkIn, checkOut) is not available in UI-only web. Use booking-service pricing endpoint (via gateway) or calculate locally with calculateTotalPriceCompat()."
  );
}

// Compatibility: pure helpers used by unit tests in this repo.
// Old signature: calculateTotalPrice(checkIn, checkOut, basePrice, seasonalPrices)
export function calculateTotalPriceCompat(
  checkIn: Date,
  checkOut: Date,
  basePrice: number,
  seasonalPrices: Array<{ startDate: Date; endDate: Date; pricePerNight: number }>
): number {
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  void nights;
  let total = 0;
  const current = new Date(checkIn);
  while (current < checkOut) {
    const applicable = seasonalPrices.find(
      (sp) => sp.startDate <= current && sp.endDate >= current
    );
    total += applicable ? applicable.pricePerNight : basePrice;
    current.setDate(current.getDate() + 1);
  }
  return total;
}

export function isDateRangeAvailable(
  checkIn: Date,
  checkOut: Date,
  bookings: Array<{ checkIn: Date; checkOut: Date }>
): boolean {
  for (const b of bookings) {
    // Overlap exists if start < existingEnd and existingStart < end
    if (checkIn < b.checkOut && b.checkIn < checkOut) return false;
  }
  return true;
}

/**
 * Tạo booking với trạng thái ON_HOLD (giữ chỗ tạm thời 15 phút)
 */
export async function createHoldBooking(
  userId: string,
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  numberOfGuests: number,
  totalPrice: number
) {
  void userId;
  void roomId;
  void checkIn;
  void checkOut;
  void numberOfGuests;
  void totalPrice;
  throw new Error(
    "createHoldBooking() is not available in UI-only web. Use gateway endpoint /api/booking/hold."
  );
}

/**
 * Xóa các booking ON_HOLD đã hết hạn
 */
export async function cleanupExpiredHolds() {
  throw new Error(
    "cleanupExpiredHolds() is not available in UI-only web. Run cleanup in booking-service (cron/worker)."
  );
}
