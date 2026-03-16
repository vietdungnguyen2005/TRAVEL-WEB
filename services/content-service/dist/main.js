"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const shared_1 = require("@travel-web/shared");
const health_1 = require("./lib/health");
const routes_1 = require("./http/routes");
const admin_hero_images_1 = require("./http/routes/admin-hero-images");
const error_handler_1 = require("./http/middlewares/error-handler");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3007;
app.use((0, shared_1.createCorrelationIdMiddleware)());
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.get('/healthz', health_1.healthHandler);
app.get('/ready', health_1.readyHandler);
app.use('/api', routes_1.heroImagesRouter);
app.use('/api/admin', admin_hero_images_1.adminHeroImagesRouter);
app.use(error_handler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Content Service running on port ${PORT}`);
});
//# sourceMappingURL=main.js.map