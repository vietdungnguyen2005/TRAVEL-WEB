interface BookingFormProps {
    roomTypeId: string;
    basePrice: number;
    capacity: number;
    onSubmit: (data: BookingData) => void;
    isSubmitting?: boolean;
}
export interface BookingData {
    checkIn: Date;
    checkOut: Date;
    guests: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    specialRequests?: string;
}
export declare function BookingForm({ roomTypeId, basePrice, capacity, onSubmit, isSubmitting }: BookingFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=booking-form.d.ts.map