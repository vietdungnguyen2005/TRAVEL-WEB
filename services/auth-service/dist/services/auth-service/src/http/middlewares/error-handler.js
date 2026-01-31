"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, _next) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
}
//# sourceMappingURL=error-handler.js.map