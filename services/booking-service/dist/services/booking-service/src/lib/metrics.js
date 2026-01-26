"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingCreateCounter = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
const register = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register });
exports.bookingCreateCounter = new prom_client_1.default.Counter({
    name: 'booking_created_total',
    help: 'Total number of bookings created',
    labelNames: ['status']
});
register.registerMetric(exports.bookingCreateCounter);
exports.default = register;
//# sourceMappingURL=metrics.js.map