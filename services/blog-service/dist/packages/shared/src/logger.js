"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    context;
    constructor(context) {
        this.context = context;
    }
    info(message, meta) {
        if (typeof meta === 'undefined') {
            console.log(`[${this.context}] INFO:`, message);
            return;
        }
        console.log(`[${this.context}] INFO:`, message, meta);
    }
    error(message, error) {
        if (typeof error === 'undefined') {
            console.error(`[${this.context}] ERROR:`, message);
            return;
        }
        console.error(`[${this.context}] ERROR:`, message, error);
    }
    warn(message, meta) {
        if (typeof meta === 'undefined') {
            console.warn(`[${this.context}] WARN:`, message);
            return;
        }
        console.warn(`[${this.context}] WARN:`, message, meta);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map