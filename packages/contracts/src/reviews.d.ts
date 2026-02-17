export {};
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
//# sourceMappingURL=reviews.d.ts.map