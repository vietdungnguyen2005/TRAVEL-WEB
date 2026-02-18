"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
function toErrorPayload(error) {
    if (!error)
        return undefined;
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }
    return { message: String(error) };
}
class Logger {
    constructor(context) {
        this.context = context;
    }
    write(level, message, meta, error) {
        const payload = {
            ts: new Date().toISOString(),
            level,
            context: this.context,
            msg: message,
        };
        if (typeof meta !== 'undefined')
            payload.meta = meta;
        const err = toErrorPayload(error);
        if (err)
            payload.error = err;
        const line = JSON.stringify(payload);
        if (level === 'error') {
            console.error(line);
        }
        else if (level === 'warn') {
            console.warn(line);
        }
        else {
            console.log(line);
        }
    }
    info(message, meta) {
        this.write('info', message, meta);
    }
    warn(message, meta) {
        this.write('warn', message, meta);
    }
    error(message, metaOrError, maybeError) {
        if (metaOrError instanceof Error || typeof metaOrError === 'undefined') {
            this.write('error', message, undefined, metaOrError);
            return;
        }
        const error = maybeError instanceof Error ? maybeError : undefined;
        this.write('error', message, metaOrError, error);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map