"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const shared_1 = require("@travel-web/shared");
const review_routes_1 = __importDefault(require("./modules/review/review.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3005;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/reviews', review_routes_1.default);
app.listen(PORT, () => {
    console.log(`Review service running on port ${PORT}`);
    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        (0, shared_1.consulRegisterService)({
            serviceName: 'reviewService',
            port: Number(PORT),
            healthCheckPath: '/reviews/health',
        }).catch((err) => console.error('Consul register failed', err));
    }
});
//# sourceMappingURL=index.js.map