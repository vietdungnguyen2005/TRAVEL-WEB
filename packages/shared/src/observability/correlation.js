"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCorrelationId = getCorrelationId;
exports.runWithCorrelationId = runWithCorrelationId;
exports.ensureCorrelationId = ensureCorrelationId;
exports.createCorrelationIdMiddleware = createCorrelationIdMiddleware;
const node_async_hooks_1 = require("node:async_hooks");
const node_crypto_1 = require("node:crypto");
const storage = new node_async_hooks_1.AsyncLocalStorage();
function getCorrelationId() {
    return storage.getStore()?.correlationId;
}
function runWithCorrelationId(correlationId, fn) {
    return storage.run({ correlationId }, fn);
}
function ensureCorrelationId(existing) {
    const cleaned = typeof existing === 'string' ? existing.trim() : '';
    if (cleaned)
        return cleaned;
    const fromContext = getCorrelationId();
    if (fromContext)
        return fromContext;
    return (0, node_crypto_1.randomUUID)();
}
function createCorrelationIdMiddleware() {
    return function correlationIdMiddleware(req, res, next) {
        const header = req.header('x-correlation-id') || req.header('x-request-id');
        const correlationId = ensureCorrelationId(header || undefined);
        res.setHeader('x-correlation-id', correlationId);
        req.correlationId = correlationId;
        return runWithCorrelationId(correlationId, () => next());
    };
}
//# sourceMappingURL=correlation.js.map