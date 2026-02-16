import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const adminHeroImagesRouter = Router();

function tryGetPrismaErrorCode(err: unknown): string | undefined {
    if (typeof err !== 'object' || err === null) return undefined;
    if (!('code' in err)) return undefined;
    const code = (err as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
}

// GET /api/admin/hero-images - list all (admin)
adminHeroImagesRouter.get('/hero-images', async (_req: Request, res: Response) => {
    try {
        const images = await prisma.heroImage.findMany({
            orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        });
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: 'Failed to list hero images' });
    }
});

// POST /api/admin/hero-images
adminHeroImagesRouter.post('/hero-images', async (req: Request, res: Response) => {
    const { title, subtitle, imageUrl, buttonText, buttonLink, order, active } = req.body ?? {};
    if (!title || !imageUrl) {
        return res.status(400).json({ error: 'title and imageUrl are required' });
    }
    try {
        const created = await prisma.heroImage.create({
            data: {
                title: String(title),
                subtitle: subtitle != null ? String(subtitle) : null,
                imageUrl: String(imageUrl),
                buttonText: buttonText != null ? String(buttonText) : null,
                buttonLink: buttonLink != null ? String(buttonLink) : null,
                order: typeof order === 'number' ? order : Number(order ?? 0),
                active: typeof active === 'boolean' ? active : true,
            },
        });
        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create hero image' });
    }
});

// PUT/PATCH /api/admin/hero-images/:id
adminHeroImagesRouter.put('/hero-images/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const { title, subtitle, imageUrl, buttonText, buttonLink, order, active } = req.body ?? {};
    try {
        const updated = await prisma.heroImage.update({
            where: { id },
            data: {
                ...(title != null && { title: String(title) }),
                ...(subtitle !== undefined && { subtitle: subtitle ? String(subtitle) : null }),
                ...(imageUrl != null && { imageUrl: String(imageUrl) }),
                ...(buttonText !== undefined && { buttonText: buttonText ? String(buttonText) : null }),
                ...(buttonLink !== undefined && { buttonLink: buttonLink ? String(buttonLink) : null }),
                ...(order !== undefined && { order: Number(order) }),
                ...(typeof active === 'boolean' && { active }),
            },
        });
        res.json(updated);
    } catch (err: unknown) {
        if (tryGetPrismaErrorCode(err) === 'P2025') return res.status(404).json({ error: 'Not found' });
        res.status(500).json({ error: 'Failed to update hero image' });
    }
});

adminHeroImagesRouter.patch('/hero-images/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const body = req.body ?? {};
    try {
        const updated = await prisma.heroImage.update({
            where: { id },
            data: {
                ...(body.title != null && { title: String(body.title) }),
                ...(body.subtitle !== undefined && { subtitle: body.subtitle ? String(body.subtitle) : null }),
                ...(body.imageUrl != null && { imageUrl: String(body.imageUrl) }),
                ...(body.buttonText !== undefined && { buttonText: body.buttonText ? String(body.buttonText) : null }),
                ...(body.buttonLink !== undefined && { buttonLink: body.buttonLink ? String(body.buttonLink) : null }),
                ...(body.order !== undefined && { order: Number(body.order) }),
                ...(typeof body.active === 'boolean' && { active: body.active }),
            },
        });
        res.json(updated);
    } catch (err: unknown) {
        if (tryGetPrismaErrorCode(err) === 'P2025') return res.status(404).json({ error: 'Not found' });
        res.status(500).json({ error: 'Failed to update hero image' });
    }
});

// DELETE /api/admin/hero-images/:id
adminHeroImagesRouter.delete('/hero-images/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        await prisma.heroImage.delete({ where: { id } });
        res.status(204).send();
    } catch (err: unknown) {
        if (tryGetPrismaErrorCode(err) === 'P2025') return res.status(404).json({ error: 'Not found' });
        res.status(500).json({ error: 'Failed to delete hero image' });
    }
});
