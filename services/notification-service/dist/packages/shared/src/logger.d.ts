export declare class Logger {
    private context;
    constructor(context: string);
    private write;
    info(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    error(message: string, error?: Error): void;
    error(message: string, meta?: unknown, error?: Error): void;
}
//# sourceMappingURL=logger.d.ts.map