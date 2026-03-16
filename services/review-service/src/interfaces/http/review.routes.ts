import express from 'express';
import { verifyJWT, requireRole, tryGetUserFromRequest } from '@travel-web/shared';
import { createPrismaReviewRepository } from '../../infrastructure/prisma/prisma-review-repository';
import { createReview } from '../../application/usecases/create-review';
import { getReviewsByRoom } from '../../application/usecases/get-reviews-by-room';
import { getUserReviews } from '../../application/usecases/get-user-reviews';
import { updateReview } from '../../application/usecases/update-review';
import { deleteReview } from '../../application/usecases/delete-review';
import { verifyReview } from '../../application/usecases/verify-review';
import { listAllReviews } from '../../application/usecases/list-all-reviews';
import { reviewCreateCounter } from '../../lib/metrics';
import prisma from '../../lib/prisma';

export const reviewRouter = express.Router();

const reviewsRepo = createPrismaReviewRepository();

/* ── Server-side input sanitization ── */

const MAX_COMMENT_LENGTH = 2000;

/**
 * Strip HTML/script tags and dangerous patterns from user-submitted text.
 * React escapes by default, but server-side sanitization is defense-in-depth.
 */
function sanitizeComment(raw: string): string {
    let text = raw;
    // Remove <script>...</script> blocks (including attributes)
    text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Remove all HTML tags
    text = text.replace(/<\/?[^>]+(>|$)/g, '');
    // Remove on* event attributes that may survive partial tags (e.g. onerror=...)
    text = text.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
    // Remove javascript: protocol
    text = text.replace(/javascript\s*:/gi, '');
    // Remove data: protocol (prevents data:text/html payloads)
    text = text.replace(/data\s*:\s*text\/html/gi, '');
    // Trim excessive whitespace
    text = text.replace(/\s+/g, ' ').trim();
    // Enforce length limit
    if (text.length > MAX_COMMENT_LENGTH) {
        text = text.slice(0, MAX_COMMENT_LENGTH);
    }
    return text;
}

/**
 * Validate and sanitize review images array.
 */
function sanitizeImages(images: unknown): string[] {
    if (!Array.isArray(images)) return [];
    return images
        .filter((img): img is string => typeof img === 'string' && img.startsWith('http'))
        .slice(0, 10); // Max 10 images per review
}

function getUserIdFromRequest(req: express.Request): string | undefined {
    const user = tryGetUserFromRequest(req);
    if (typeof user?.id === 'string') return user.id;
    // Fallback: gateway already verified JWT and forwarded x-user-id header
    const headerUserId = req.headers['x-user-id'];
    if (typeof headerUserId === 'string' && headerUserId.length > 0) return headerUserId;
    return undefined;
}

function getUserRoleFromRequest(req: express.Request): string | undefined {
    const user = tryGetUserFromRequest(req);
    if (typeof user?.role === 'string') return user.role;
    // Fallback: gateway-forwarded x-user-role header
    const headerRole = req.headers['x-user-role'];
    if (typeof headerRole === 'string' && headerRole.length > 0) return headerRole;
    return undefined;
}

/**
 * Enrich reviews with user name/image from the auth schema via cross-schema query.
 */
async function enrichReviewsWithUserData(reviews: Array<Record<string, unknown>>): Promise<Array<Record<string, unknown>>> {
    if (reviews.length === 0) return reviews;

    const userIds = [...new Set(reviews.map(r => r.userId as string).filter(Boolean))];
    if (userIds.length === 0) return reviews;

    try {
        const users = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; image: string | null }>>(
            `SELECT id, name, image FROM auth."User" WHERE id = ANY($1::text[])`,
            userIds,
        );
        const userMap = new Map(users.map(u => [u.id, u]));

        return reviews.map(r => ({
            ...r,
            user: {
                name: userMap.get(r.userId as string)?.name ?? null,
                image: userMap.get(r.userId as string)?.image ?? null,
            },
        }));
    } catch {
        // If cross-schema query fails, return with null user data (graceful degradation)
        return reviews.map(r => ({
            ...r,
            user: { name: null, image: null },
        }));
    }
}

// GET /reviews — list all reviews (public)
reviewRouter.get('/', async (_req, res, next) => {
    try {
        const reviews = await listAllReviews({ reviews: reviewsRepo });
        res.json(reviews);
    } catch (err) {
        next(err);
    }
});

// GET /reviews/my — current user's reviews (auth required)
reviewRouter.get('/my', verifyJWT, async (req, res, next) => {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const reviews = await getUserReviews({ reviews: reviewsRepo, userId });
        res.json(reviews);
    } catch (err) {
        next(err);
    }
});

// GET /reviews/room/:roomTypeId — reviews for a specific room type (public)
// Also aliased as /reviews/room-type/:roomTypeId for frontend compatibility
async function handleGetReviewsByRoom(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const { roomTypeId } = req.params;
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

        const allReviews = await getReviewsByRoom({ reviews: reviewsRepo, roomTypeId });

        // Compute stats
        const totalReviews = allReviews.length;
        const averageRating = totalReviews > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;
        const distribution = [5, 4, 3, 2, 1].map((rating) => ({
            rating,
            count: allReviews.filter((r) => r.rating === rating).length,
        }));

        // Paginate
        const start = (page - 1) * limit;
        const paginatedReviews = allReviews.slice(start, start + limit);
        const totalPages = Math.ceil(totalReviews / limit);

        // Enrich with user data from auth schema
        const enrichedReviews = await enrichReviewsWithUserData(
            paginatedReviews.map(r => ({ ...r })),
        );

        res.json({
            reviews: enrichedReviews,
            stats: { averageRating, totalReviews, distribution },
            pagination: { page, totalPages },
        });
    } catch (err) {
        next(err);
    }
}

reviewRouter.get('/room/:roomTypeId', handleGetReviewsByRoom);
reviewRouter.get('/room-type/:roomTypeId', handleGetReviewsByRoom);

// GET /reviews/:id — single review (public)
reviewRouter.get('/:id', async (req, res, next) => {
    try {
        const review = await reviewsRepo.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        res.json(review);
    } catch (err) {
        next(err);
    }
});

// POST /reviews — create review (auth required)
reviewRouter.post('/', verifyJWT, async (req, res, next) => {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { bookingId, roomTypeId, roomId, rating, comment, images } = req.body;

        if (!bookingId || typeof bookingId !== 'string') {
            return res.status(400).json({ error: 'bookingId is required' });
        }

        const resolvedRoomTypeId = roomTypeId || roomId || '';
        if (!resolvedRoomTypeId) {
            return res.status(400).json({ error: 'roomTypeId or roomId is required' });
        }

        // Validate bookingId exists and belongs to user via booking-service
        try {
            const bookingUrl = process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';
            const resp = await fetch(`${bookingUrl}/api/bookings/${bookingId}`, {
                headers: {
                    'x-user-id': userId,
                    'x-user-role': 'CUSTOMER',
                },
            });
            if (!resp.ok) {
                return res.status(400).json({ error: 'Invalid booking or booking not found' });
            }
            const bookingResp = await resp.json() as { data?: { userId?: string; status?: string }; userId?: string; status?: string };
            // Booking-service wraps response in { data: ... }
            const booking = bookingResp.data ?? bookingResp;
            if (booking.userId !== userId) {
                return res.status(403).json({ error: 'You can only review your own bookings' });
            }
            if (booking.status !== 'COMPLETED' && booking.status !== 'CONFIRMED') {
                return res.status(400).json({ error: 'You can only review completed or confirmed bookings' });
            }
        } catch {
            // If booking-service is unreachable, BLOCK review creation (security over availability)
            return res.status(503).json({ error: 'Booking service is unavailable. Please try again later.' });
        }

        // Check for duplicate review (same user + same booking)
        const existing = await reviewsRepo.findByUserAndBooking(userId, bookingId);
        if (existing) {
            return res.status(409).json({ error: 'You have already reviewed this booking' });
        }

        const review = await createReview({
            reviews: reviewsRepo,
            input: {
                userId,
                bookingId,
                roomTypeId: resolvedRoomTypeId,
                rating: Number(rating),
                comment: typeof comment === 'string' ? sanitizeComment(comment) : null,
                images: sanitizeImages(images),
            },
        });

        res.status(201).json(review);
        try { reviewCreateCounter.inc(); } catch { /* ignore */ }
    } catch (err) {
        next(err);
    }
});

// PUT /reviews/:id — update own review (auth required)
reviewRouter.put('/:id', verifyJWT, async (req, res, next) => {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { rating, comment, images } = req.body;

        const review = await updateReview({
            reviews: reviewsRepo,
            reviewId: req.params.id,
            userId,
            input: {
                rating: rating !== undefined ? Number(rating) : undefined,
                comment: comment !== undefined
                    ? (typeof comment === 'string' ? sanitizeComment(comment) : undefined)
                    : undefined,
                images: images !== undefined ? sanitizeImages(images) : undefined,
            },
        });

        res.json(review);
    } catch (err) {
        next(err);
    }
});

// DELETE /reviews/:id — delete own review or admin delete (auth required)
reviewRouter.delete('/:id', verifyJWT, async (req, res, next) => {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const role = getUserRoleFromRequest(req);
        await deleteReview({
            reviews: reviewsRepo,
            reviewId: req.params.id,
            userId,
            isAdmin: role === 'ADMIN',
        });

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

// PATCH /reviews/:id/verify — admin mark review as verified
reviewRouter.patch('/:id/verify', verifyJWT, requireRole('ADMIN'), async (req, res, next) => {
    try {
        const review = await verifyReview({
            reviews: reviewsRepo,
            reviewId: req.params.id,
        });
        res.json(review);
    } catch (err) {
        next(err);
    }
});
