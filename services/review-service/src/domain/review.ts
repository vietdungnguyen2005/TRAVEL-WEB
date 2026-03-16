export type Review = {
    id: string;
    userId: string;
    bookingId: string;
    roomTypeId: string;
    rating: number;
    comment: string | null;
    images: string[];
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
};
