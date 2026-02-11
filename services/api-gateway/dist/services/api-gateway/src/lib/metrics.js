"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpRequestDurationSeconds = exports.httpRequestsTotal = exports.register = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
exports.register = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register: exports.register });
exports.httpRequestsTotal = new prom_client_1.default.Counter({
    name: 'gateway_http_requests_total',
    help: 'Total HTTP requests handled by the API gateway',
    labelNames: ['method', 'route', 'status'],
});
exports.httpRequestDurationSeconds = new prom_client_1.default.Histogram({
    name: 'gateway_http_request_duration_seconds',
    help: 'HTTP request duration in seconds (API gateway)',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});
exports.register.registerMetric(exports.httpRequestsTotal);
exports.register.registerMetric(exports.httpRequestDurationSeconds);
//# sourceMappingURL=metrics.js.map