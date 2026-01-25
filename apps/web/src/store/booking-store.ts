import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookingState {
  checkIn: Date | null;
  checkOut: Date | null;
  numberOfGuests: number;
  selectedRoomId: string | null;
  bookingData: any | null;
  setCheckIn: (date: Date | null) => void;
  setCheckOut: (date: Date | null) => void;
  setNumberOfGuests: (count: number) => void;
  setSelectedRoom: (roomId: string | null) => void;
  setBookingData: (data: any) => void;
  clearBookingData: () => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      checkIn: null,
      checkOut: null,
      numberOfGuests: 1,
      selectedRoomId: null,
      bookingData: null,
      setCheckIn: (date) => set({ checkIn: date }),
      setCheckOut: (date) => set({ checkOut: date }),
      setNumberOfGuests: (count) => set({ numberOfGuests: count }),
      setSelectedRoom: (roomId) => set({ selectedRoomId: roomId }),
      setBookingData: (data) => set({ bookingData: data }),
      clearBookingData: () => set({ bookingData: null }),
      resetBooking: () =>
        set({
          checkIn: null,
          checkOut: null,
          numberOfGuests: 1,
          selectedRoomId: null,
        }),
    }),
    {
      name: 'booking-storage',
    }
  )
);
