"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = require("dotenv");
const cors_middleware_1 = require("./middlewares/cors.middleware");
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const logging_middleware_1 = require("./middlewares/logging.middleware");
const routes_1 = __importDefault(require("./routes"));
// Load environment variables
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Middlewares
app.use((0, helmet_1.default)());
app.use(cors_middleware_1.corsMiddleware);
app.use(rateLimit_middleware_1.rateLimitMiddleware);
app.use(logging_middleware_1.loggingMiddleware);
// Routes
app.use(routes_1.default);
// Global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});
// Start server
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
//# sourceMappingURL=main.js.map