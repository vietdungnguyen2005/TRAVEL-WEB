"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readyHandler = exports.healthHandler = void 0;
const healthHandler = (_req, res) => {
    res.status(200).send('content-service healthy');
};
exports.healthHandler = healthHandler;
const readyHandler = (_req, res) => {
    res.status(200).json({ ok: true });
};
exports.readyHandler = readyHandler;
//# sourceMappingURL=health.js.map