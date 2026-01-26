import mongoose, { Schema } from 'mongoose';
const ReviewSchema = new Schema({
    userId: { type: String, required: true },
    bookingId: { type: String, required: true },
    roomTypeId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: false },
    images: { type: [String], required: false, default: [] },
    isVerified: { type: Boolean, required: false, default: false },
}, {
    timestamps: true,
    versionKey: false,
});
// Align with Postgres unique constraint @@unique([userId, bookingId])
ReviewSchema.index({ userId: 1, bookingId: 1 }, { unique: true });
export const ReviewModel = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
//# sourceMappingURL=review.model.js.map