"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthHandler = healthHandler;
exports.readyHandler = readyHandler;
const shared_1 = require("@travel-web/shared");
const logger = new shared_1.Logger('Health');
function healthHandler(req, res) {
    res.status(200).json({ status: 'ok' });
}
function readyHandler(req, res) {
    // TODO: add readiness checks (DB, RabbitMQ) if needed
    res.status(200).json({ status: 'ready' });
}
//# sourceMappingURL=health.js.map