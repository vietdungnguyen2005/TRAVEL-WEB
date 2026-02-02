import { Router } from 'express';
import { getHeroImagesHandler } from './modules/hero-images/hero-images.controller';

export const heroImagesRouter = Router();

// Public content for homepage hero carousel
heroImagesRouter.get('/hero-images', getHeroImagesHandler);
