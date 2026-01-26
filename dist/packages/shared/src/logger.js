export class Logger {
    context;
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
//# sourceMappingURL=logger.js.map