export * from './booking';
export * from './rooms';
export * from './payments';
export * from './reviews';
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
export { CreateBookingSchema } from './booking';
export { CreateBookingDTO, BookingResponseDTO } from './booking';
//# sourceMappingURL=index.d.ts.map