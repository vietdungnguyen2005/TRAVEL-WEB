"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heroImagesRouter = void 0;
const express_1 = require("express");
const hero_images_controller_1 = require("./modules/hero-images/hero-images.controller");
exports.heroImagesRouter = (0, express_1.Router)();
// Public content for homepage hero carousel
exports.heroImagesRouter.get('/hero-images', hero_images_controller_1.getHeroImagesHandler);
//# sourceMappingURL=routes.js.map