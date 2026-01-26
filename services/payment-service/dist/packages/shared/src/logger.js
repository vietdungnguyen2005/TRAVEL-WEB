"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(context) {
        this.context = context;
    }
    info(message, meta) {
        console.log(`[${this.context}] INFO:`, message, meta);
    }
    error(message, error) {
        console.error(`[${this.context}] ERROR:`, message, error);
    }
    warn(message, meta) {
        console.warn(`[${this.context}] WARN:`, message, meta);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map