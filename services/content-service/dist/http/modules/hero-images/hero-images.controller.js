"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeroImagesHandler = getHeroImagesHandler;
const hero_images_service_1 = require("../../../modules/hero-images/hero-images.service");
async function getHeroImagesHandler(_req, res, next) {
    try {
        const heroImages = await (0, hero_images_service_1.listHeroImages)();
        res.json({ success: true, data: heroImages });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=hero-images.controller.js.map