import { calculateTotalPrice, isDateRangeAvailable } from '../booking-utils';

describe('booking-utils', () => {
  describe('calculateTotalPrice', () => {
    it('should calculate basic price without seasonal pricing', () => {
      const checkIn = new Date('2026-03-01');
      const checkOut = new Date('2026-03-03');
      const basePrice = 1000000;
      const seasonalPrices = [];

      const total = calculateTotalPrice(checkIn, checkOut, basePrice, seasonalPrices);

      expect(total).toBe(2000000); // 2 nights * 1M
    });

    it('should apply seasonal pricing when dates overlap', () => {
      const checkIn = new Date('2025-12-24');
      const checkOut = new Date('2025-12-26');
      const basePrice = 1000000;
      const seasonalPrices = [
        {
          startDate: new Date('2025-12-23'),
          endDate: new Date('2025-12-26'),
          pricePerNight: 2000000,
        },
      ];

      const total = calculateTotalPrice(checkIn, checkOut, basePrice, seasonalPrices);

      expect(total).toBe(4000000); // 2 nights * 2M (seasonal)
    });

    it('should handle mixed seasonal and base pricing', () => {
      const checkIn = new Date('2025-12-25');
      const checkOut = new Date('2025-12-28');
      const basePrice = 1000000;
      const seasonalPrices = [
        {
          startDate: new Date('2025-12-23'),
          endDate: new Date('2025-12-26'),
          pricePerNight: 2000000,
        },
      ];

      const total = calculateTotalPrice(checkIn, checkOut, basePrice, seasonalPrices);

      // Dec 25-26: 1 night at 2M (seasonal)
      // Dec 26-27: 1 night at 1M (base)
      // Dec 27-28: 1 night at 1M (base)
      expect(total).toBe(4000000);
    });
  });

  describe('isDateRangeAvailable', () => {
    it('should return true for available dates', () => {
      const checkIn = new Date('2026-01-01');
      const checkOut = new Date('2026-01-03');
      const bookings = [];

      const result = isDateRangeAvailable(checkIn, checkOut, bookings);

      expect(result).toBe(true);
    });

    it('should return false when dates overlap with existing booking', () => {
      const checkIn = new Date('2026-01-02');
      const checkOut = new Date('2026-01-04');
      const bookings = [
        {
          checkIn: new Date('2026-01-01'),
          checkOut: new Date('2026-01-03'),
        },
      ];

      const result = isDateRangeAvailable(checkIn, checkOut, bookings);

      expect(result).toBe(false);
    });

    it('should return true when bookings are adjacent but not overlapping', () => {
      const checkIn = new Date('2026-01-03');
      const checkOut = new Date('2026-01-05');
      const bookings = [
        {
          checkIn: new Date('2026-01-01'),
          checkOut: new Date('2026-01-03'), // Check-out on same day as new check-in
        },
      ];

      const result = isDateRangeAvailable(checkIn, checkOut, bookings);

      expect(result).toBe(true); // Same day check-out/check-in should be allowed
    });
  });
});
