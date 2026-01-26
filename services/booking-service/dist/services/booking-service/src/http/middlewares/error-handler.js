"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
}
//# sourceMappingURL=error-handler.js.map