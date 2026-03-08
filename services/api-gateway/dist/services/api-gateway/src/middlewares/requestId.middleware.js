"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = requestIdMiddleware;
const crypto_1 = require("crypto");
const shared_1 = require("@travel-web/shared");
function requestIdMiddleware(req, res, next) {
    const inbound = req.header('x-request-id');
    const requestId = (typeof inbound === 'string' && inbound.trim().length > 0) ? inbound : (0, crypto_1.randomUUID)();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    res.setHeader('x-correlation-id', requestId);
    return (0, shared_1.runWithCorrelationId)(requestId, () => next());
}
//# sourceMappingURL=requestId.middleware.js.map