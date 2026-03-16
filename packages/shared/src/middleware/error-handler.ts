import type { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors';
import { Logger } from '../logger';
import { getCorrelationId } from '../observability/correlation';

/**
 * Well-known Prisma Client error codes.
 * @see https://www.prisma.io/docs/reference/api-reference/error-reference
 */
const PRISMA_ERROR_MAP: Record<string, { status: number; message: string }> = {
    P2000: { status: 400, message: 'Value too long for the column' },
    P2001: { status: 404, message: 'Record not found' },
    P2002: { status: 409, message: 'A record with this value already exists' },
    P2003: { status: 400, message: 'Foreign key constraint failed' },
    P2025: { status: 404, message: 'Record not found' },
};

function isPrismaError(err: unknown): err is Error & { code: string; meta?: Record<string, unknown> } {
    if (!err || typeof err !== 'object') return false;
    const e = err as Record<string, unknown>;
    return typeof e.code === 'string' && e.code.startsWith('P') && e instanceof Error;
}

/**
 * Determine if we are in production mode.
 */
function isProd() {
    return process.env.NODE_ENV === 'production';
}

export type ErrorResponseBody = {
    success: false;
    error: string;
    code?: string;
    details?: Record<string, string[]>;
    correlationId?: string;
};

/**
 * Creates a centralized Express error-handling middleware.
 *
 * Usage:
 * ```ts
 * import { createErrorHandler } from '@travel-web/shared';
 * app.use(createErrorHandler('my-service'));
 * ```
 *
 * Handles:
 * - AppError subclasses (statusCode, code, details)
 * - Object.assign(new Error(...), { statusCode }) pattern
 * - Prisma client errors (P2002, P2025, etc.)
 * - Unknown / unexpected errors → 500
 */
export function createErrorHandler(serviceName: string) {
    const logger = new Logger(serviceName);

    return function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
        void _next; // Satisfy Express error handler signature

        const correlationId = getCorrelationId() || (req.headers['x-correlation-id'] as string) || undefined;
        const body: ErrorResponseBody = {
            success: false,
            error: 'Internal Server Error',
        };
        let statusCode = 500;

        // ── 1. AppError (and subclasses) ──
        if (err instanceof AppError) {
            statusCode = err.statusCode;
            body.error = err.message;
            body.code = err.code;

            if (err instanceof ValidationError && err.details) {
                body.details = err.details;
            }
        }
        // ── 2. Legacy pattern: Object.assign(new Error(...), { statusCode }) ──
        else if (err instanceof Error && typeof (err as unknown as Record<string, unknown>).statusCode === 'number') {
            statusCode = (err as unknown as Record<string, unknown>).statusCode as number;
            body.error = err.message;
        }
        // ── 3. Prisma Client Known Request Error ──
        else if (isPrismaError(err)) {
            const mapped = PRISMA_ERROR_MAP[err.code];
            if (mapped) {
                statusCode = mapped.status;
                body.error = mapped.message;
                body.code = err.code;
            } else {
                // Unknown Prisma code – hide internals
                statusCode = 500;
                body.error = 'Database error';
            }
        }
        // ── 4. Generic Error ──
        else if (err instanceof Error) {
            body.error = isProd() ? 'Internal Server Error' : err.message;
        }
        // ── 5. Unknown throw value ──
        else {
            body.error = 'Internal Server Error';
        }

        // Attach correlation ID so client can reference logs
        if (correlationId) {
            body.correlationId = correlationId;
        }

        // ── Logging ──
        // Only log 5xx as error; 4xx are expected application errors
        const logMeta = {
            method: req.method,
            path: req.path,
            statusCode,
            correlationId,
        };

        if (statusCode >= 500) {
            logger.error('unhandled_error', logMeta, err instanceof Error ? err : new Error(String(err)));
        } else {
            logger.warn('client_error', logMeta);
        }

        // ── In production, never leak internal error details for 500s ──
        if (isProd() && statusCode >= 500) {
            body.error = 'Internal Server Error';
            delete body.code;
            delete body.details;
        }

        res.status(statusCode).json(body);
    };
}
