"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Service-to-gateway calls are server-side; keep CORS permissive for local dev.
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.get('/health', (_req, res) => {
    res.status(200).json({ success: true, data: 'content-service healthy' });
});
// Public content for homepage hero carousel
app.get('/api/hero-images', async (_req, res, next) => {
    try {
        // NOTE: This service is intentionally lightweight.
        // In production we'd persist this in a dedicated content DB.
        // For now we serve a static list matching prisma/seed-hero-images.ts.
        const images = [
            {
                title: 'Kh\u00e1m Ph\u00e1 Thi\u00ean \u0110\u01b0\u1eddng Ngh\u1ec9 D\u01b0\u1ee1ng',
                subtitle: 'Tr\u1ea3i nghi\u1ec7m k\u1ef3 ngh\u1ec9 ho\u00e0n h\u1ea3o t\u1ea1i resort 5 sao v\u1edbi view bi\u1ec3n tuy\u1ec7t \u0111\u1eb9p',
                imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=600&fit=crop',
                buttonText: '\u0110\u1eb7t Ph\u00f2ng Ngay',
                buttonLink: '/rooms',
                order: 0,
                active: true,
            },
            {
                title: 'Kh\u00f4ng Gian Sang Tr\u1ecdng & Hi\u1ec7n \u0110\u1ea1i',
                subtitle: 'Ph\u00f2ng kh\u00e1ch s\u1ea1n \u0111\u1eb3ng c\u1ea5p v\u1edbi \u0111\u1ea7y \u0111\u1ee7 ti\u1ec7n nghi cao c\u1ea5p',
                imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=600&fit=crop',
                buttonText: 'Xem C\u00e1c Ph\u00f2ng',
                buttonLink: '/rooms',
                order: 1,
                active: true,
            },
            {
                title: '\u01afu \u0110\u00e3i \u0110\u1eb7c Bi\u1ec7t Cu\u1ed1i N\u0103m',
                subtitle: 'Gi\u1ea3m gi\u00e1 l\u00ean \u0111\u1ebfn 30% cho \u0111\u1eb7t ph\u00f2ng t\u1eeb 3 \u0111\u00eam tr\u1edf l\u00ean',
                imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&h=600&fit=crop',
                buttonText: 'Kh\u00e1m Ph\u00e1 Ngay',
                buttonLink: '/rooms',
                order: 2,
                active: true,
            },
        ].filter((x) => x.active).sort((a, b) => a.order - b.order);
        // Ensure no caching at the edge/browser (content can change often in dev)
        res.setHeader('Cache-Control', 'no-store');
        res.json(images);
    }
    catch (err) {
        next(err);
    }
});
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});
const port = Number(process.env.PORT || 3007);
app.listen(port, () => {
    console.log(`Content service running on port ${port}`);
});
//# sourceMappingURL=index.js.map