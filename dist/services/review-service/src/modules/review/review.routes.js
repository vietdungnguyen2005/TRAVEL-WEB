import { Router } from 'express';
import { z } from 'zod';
import { connectMongo } from '../../lib/mongo';
import { ReviewModel } from './review.model';
const router = Router();
const CreateReviewSchema = z.object({
    userId: z.string().min(1),
    bookingId: z.string().min(1),
    roomTypeId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
    images: z.array(z.string()).optional(),
    isVerified: z.boolean().optional(),
});
router.get('/health', (_req, res) => res.send('Review service healthy'));
// Create review
router.post('/', async (req, res) => {
    await connectMongo();
    const parsed = CreateReviewSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Invalid payload',
            issues: parsed.error.issues,
        });
    }
    try {
        const doc = await ReviewModel.create({
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
    await connectMongo();
    const roomTypeId = req.params.id;
    const reviews = await ReviewModel.find({ roomTypeId })
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
export default router;
//# sourceMappingURL=review.routes.js.map