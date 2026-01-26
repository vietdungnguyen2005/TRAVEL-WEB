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
export declare const useBookingStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<BookingState>, "setState" | "persist"> & {
    setState(partial: BookingState | Partial<BookingState> | ((state: BookingState) => BookingState | Partial<BookingState>), replace?: false | undefined): unknown;
    setState(state: BookingState | ((state: BookingState) => BookingState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<BookingState, BookingState, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: BookingState) => void) => () => void;
        onFinishHydration: (fn: (state: BookingState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<BookingState, BookingState, unknown>>;
    };
}>;
export {};
//# sourceMappingURL=booking-store.d.ts.map