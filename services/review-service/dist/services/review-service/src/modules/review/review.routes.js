"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const mongo_1 = require("../../lib/mongo");
const review_model_1 = require("./review.model");
const router = (0, express_1.Router)();
const CreateReviewSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1),
    bookingId: zod_1.z.string().min(1),
    roomTypeId: zod_1.z.string().min(1),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().optional(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
    isVerified: zod_1.z.boolean().optional(),
});
router.get('/health', (_req, res) => res.send('Review service healthy'));
// Create review
router.post('/', async (req, res) => {
    await (0, mongo_1.connectMongo)();
    const parsed = CreateReviewSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Invalid payload',
            issues: parsed.error.issues,
        });
    }
    try {
        const doc = await review_model_1.ReviewModel.create({
            ...parsed.data,
            images: parsed.data.images ?? [],
            isVerified: parsed.data.isVerified ?? false,
        });
        return res.status(201).json({
            id: doc._id.toString(),
            userId: doc.userId,
            bookingId: doc.bookingId,
            roomTypeId: doc.roomTypeId,
            rating: doc.rating,
            comment: doc.comment ?? null,
            images: doc.images ?? [],
            isVerified: doc.isVerified,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
    catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({
                message: 'Review already exists for this booking',
            });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
});
// List reviews by roomType
router.get('/room-type/:id', async (req, res) => {
    await (0, mongo_1.connectMongo)();
    const roomTypeId = req.params.id;
    const reviews = await review_model_1.ReviewModel.find({ roomTypeId })
        .sort({ createdAt: -1 })
        .lean();
    return res.json(reviews.map((r) => ({
        id: r._id.toString(),
        userId: r.userId,
        bookingId: r.bookingId,
        roomTypeId: r.roomTypeId,
        rating: r.rating,
        comment: r.comment ?? null,
        images: r.images ?? [],
        isVerified: r.isVerified ?? false,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    })));
});
exports.default = router;
//# sourceMappingURL=review.routes.js.map