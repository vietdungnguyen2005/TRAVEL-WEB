"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shared_1 = require("@travel-web/shared");
const auth_1 = require("./middlewares/auth");
const rate_limit_1 = require("./middlewares/rate-limit");
const error_handler_1 = require("./middlewares/error-handler");
// Route handlers
const booking_1 = require("./routes/booking");
const rooms_1 = require("./routes/rooms");
const auth_2 = require("./routes/auth");
const payments_1 = require("./routes/payments");
const logger = new shared_1.Logger('APIGateway');
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4100;
// Middlewares
app.use(express_1.default.json());
app.use(rate_limit_1.rateLimitMiddleware);
// Routes
app.use('/api/auth', auth_2.authRoutes);
app.use('/api/bookings', auth_1.authMiddleware, booking_1.bookingRoutes);
app.use('/api/rooms', rooms_1.roomRoutes);
app.use('/api/payments', auth_1.authMiddleware, payments_1.paymentRoutes);
// Error handling
app.use(error_handler_1.errorHandler);
app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map