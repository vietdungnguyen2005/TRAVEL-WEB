import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../../lib/prisma';

const router = Router();

/**
 * GET /api/user/profile
 * Returns the authenticated user's profile.
 * Requires x-user-id header (set by the gateway after JWT verification).
 */
router.get('/profile', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                role: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(user);
    } catch (err) {
        console.error('[user-profile] GET /profile error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * PUT /api/user/profile
 * Updates the authenticated user's profile (name, phone, image).
 */
const updateProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().max(20).optional().nullable(),
    image: z.string().url().max(2000).optional().nullable(),
});

router.put('/profile', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: 'Validation failed',
                details: parsed.error.flatten().fieldErrors,
            });
        }

        // Only include fields that were actually provided
        const updateData: Record<string, unknown> = {};
        if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
        if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
        if (parsed.data.image !== undefined) updateData.image = parsed.data.image;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                role: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return res.json(updatedUser);
    } catch (err) {
        console.error('[user-profile] PUT /profile error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * POST /api/user/change-password
 * Allows the authenticated user to change their password.
 */
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

router.post('/change-password', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const parsed = changePasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: 'Validation failed',
                details: parsed.error.flatten().fieldErrors,
            });
        }

        const { currentPassword, newPassword } = parsed.data;

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, password: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Don't allow same password
        if (currentPassword === newPassword) {
            return res.status(400).json({ message: 'New password must be different from current password' });
        }

        // Hash and update
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('[user-profile] POST /change-password error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * POST /api/user/avatar
 * Uploads an avatar image for the authenticated user.
 * Accepts multipart form data with a "file" field.
 */
const UPLOAD_DIR = path.resolve(__dirname, '../../../public/uploads/avatars');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const avatarStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const userId = (req.headers['x-user-id'] as string) || 'unknown';
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `${userId}-${Date.now()}${ext}`);
    },
});

const avatarUpload = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
        if (!allowed.test(path.extname(file.originalname))) {
            return cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
        }
        cb(null, true);
    },
});

router.post('/avatar', (req: Request, res: Response) => {
    avatarUpload.single('file')(req, res, async (err: unknown) => {
        try {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ message: 'File too large. Maximum size is 5MB' });
                }
                return res.status(400).json({ message: err.message });
            }
            if (err instanceof Error) {
                return res.status(400).json({ message: err.message });
            }

            const userId = req.headers['x-user-id'] as string;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            // Build the public URL for the uploaded file
            const port = process.env.PORT || 3001;
            const host = process.env.PUBLIC_URL || `http://localhost:${port}`;
            const url = `${host}/uploads/avatars/${req.file.filename}`;

            // Update user profile with the new image URL
            await prisma.user.update({
                where: { id: userId },
                data: { image: url },
            });

            return res.json({ url });
        } catch (innerErr) {
            console.error('[user-profile] POST /avatar error:', innerErr);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
});

export { router as userProfileRouter };
