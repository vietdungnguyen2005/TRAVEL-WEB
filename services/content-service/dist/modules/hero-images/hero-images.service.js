"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listHeroImages = listHeroImages;
const prisma_1 = require("../../lib/prisma");
async function listHeroImages() {
    return prisma_1.prisma.heroImage.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }],
    });
}
//# sourceMappingURL=hero-images.service.js.map