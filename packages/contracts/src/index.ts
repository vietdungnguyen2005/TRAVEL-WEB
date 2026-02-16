export * from './booking';
export * from './rooms';
export * from './payments';
export * from './reviews';
export * from './events';

// Added exports for auth-related DTOs
export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    token: string;
    user: {
        id: string;
        email: string;
        name?: string;
    };
};

// Added exports for review-related DTOs
export type ReviewRequest = {
    userId: string;
    roomId: string;
    rating: number;
    comment: string;
};

export type ReviewResponse = {
    id: string;
    userId: string;
    roomId: string;
    rating: number;
    comment: string;
    createdAt: string;
};

// Export CreateBookingSchema for external usage
export { CreateBookingSchema } from './booking';
export { CreateBookingDTO, BookingResponseDTO } from './booking';