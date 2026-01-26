import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useBookingStore = create()(persist((set) => ({
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
    resetBooking: () => set({
        checkIn: null,
        checkOut: null,
        numberOfGuests: 1,
        selectedRoomId: null,
    }),
}), {
    name: 'booking-storage',
}));
//# sourceMappingURL=booking-store.js.map