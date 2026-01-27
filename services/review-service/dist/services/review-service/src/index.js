"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shared_1 = require("@travel-web/shared");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3005;
app.get('/health', (req, res) => res.send('Review service healthy'));
app.listen(PORT, () => {
    console.log(`Review service running on port ${PORT}`);
    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        (0, shared_1.consulRegisterService)({
            serviceName: 'reviewService',
            port: Number(PORT),
            healthCheckPath: '/health',
        }).catch((err) => console.error('Consul register failed', err));
    }
});
//# sourceMappingURL=index.js.map