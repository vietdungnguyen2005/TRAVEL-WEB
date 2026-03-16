import type { NextFunction, Request, Response } from 'express';
export declare function getCorrelationId(): string | undefined;
export declare function runWithCorrelationId<T>(correlationId: string, fn: () => T): T;
export declare function ensureCorrelationId(existing?: string): string;
export declare function createCorrelationIdMiddleware(): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=correlation.d.ts.map