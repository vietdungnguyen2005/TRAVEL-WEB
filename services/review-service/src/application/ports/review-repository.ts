import type { Review } from '../../domain/review';

export type CreateReviewInput = {
    userId: string;
    bookingId: string;
    roomTypeId: string;
    rating: number;
    comment: string | null;
    images: string[];
};

export type UpdateReviewInput = {
    rating?: number;
    comment?: string | null;
    images?: string[];
};

export type ReviewRepository = {
    findById(id: string): Promise<Review | null>;
    findByUserAndBooking(userId: string, bookingId: string): Promise<Review | null>;
    findManyByRoomTypeId(roomTypeId: string): Promise<Review[]>;
    findManyByUserId(userId: string): Promise<Review[]>;
    findAll(): Promise<Review[]>;
    create(input: CreateReviewInput): Promise<Review>;
    update(id: string, input: UpdateReviewInput): Promise<Review>;
    delete(id: string): Promise<void>;
    verify(id: string): Promise<Review>;
};
