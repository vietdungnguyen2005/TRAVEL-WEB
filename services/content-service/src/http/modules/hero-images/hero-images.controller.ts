import type { Request, Response, NextFunction } from 'express';
import { listHeroImages } from '../../../modules/hero-images/hero-images.service';

export async function getHeroImagesHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const heroImages = await listHeroImages();
        res.json({ success: true, data: heroImages });
    } catch (err) {
        next(err);
    }
}
