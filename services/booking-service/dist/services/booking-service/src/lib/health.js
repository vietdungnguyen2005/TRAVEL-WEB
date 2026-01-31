"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthHandler = healthHandler;
exports.readyHandler = readyHandler;
function healthHandler(_req, res) {
    res.status(200).json({ status: 'ok' });
}
function readyHandler(_req, res) {
    // TODO: add readiness checks (DB, RabbitMQ) if needed
    res.status(200).json({ status: 'ready' });
}
//# sourceMappingURL=health.js.map