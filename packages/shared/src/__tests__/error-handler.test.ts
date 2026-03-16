import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { createErrorHandler } from '../middleware/error-handler';
import { AppError, NotFoundError, ValidationError, ConflictError } from '../errors';

/* ── Test helpers ── */

function mockReq(): Request {
    return {
        method: 'GET',
        url: '/test',
        headers: {},
    } as unknown as Request;
}

function mockRes(): Response & { _status: number; _body: unknown } {
    const res: any = {
        _status: 200,
        _body: null,
        headersSent: false,
        status(code: number) {
            res._status = code;
            return res;
        },
        json(body: unknown) {
            res._body = body;
            return res;
        },
    };
    return res;
}

function mockNext(): NextFunction {
    return vi.fn();
}

describe('createErrorHandler', () => {
    const handler = createErrorHandler('test-service');

    // Silence logger output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    it('should handle AppError with correct status code', () => {
        const req = mockReq();
        const res = mockRes();
        const next = mockNext();

        const err = new AppError(400, 'Bad request', 'BAD_REQUEST');
        handler(err, req, res as any, next);

        expect(res._status).toBe(400);
        expect(res._body).toBeDefined();
        expect((res._body as any).success).toBe(false);
        expect((res._body as any).error).toBe('Bad request');
    });

    it('should handle NotFoundError as 404', () => {
        const req = mockReq();
        const res = mockRes();
        const next = mockNext();

        const err = new NotFoundError('User');
        handler(err, req, res as any, next);

        expect(res._status).toBe(404);
        expect((res._body as any).error).toBe('User not found');
    });

    it('should handle ValidationError and include details', () => {
        const req = mockReq();
        const res = mockRes();
        const next = mockNext();

        const err = new ValidationError('Invalid input', {
            email: ['email is required'],
        });
        handler(err, req, res as any, next);

        expect(res._status).toBe(400);
        expect((res._body as any).details).toBeDefined();
        expect((res._body as any).details.email).toContain('email is required');
    });

    it('should handle ConflictError as 409', () => {
        const req = mockReq();
        const res = mockRes();
        const next = mockNext();

        const err = new ConflictError('Booking already exists');
        handler(err, req, res as any, next);

        expect(res._status).toBe(409);
    });

    it('should handle unknown errors as 500', () => {
        const req = mockReq();
        const res = mockRes();
        const next = mockNext();

        const err = new Error('unexpected');
        handler(err, req, res as any, next);

        expect(res._status).toBe(500);
        expect((res._body as any).success).toBe(false);
    });

    it('should not leak error stack in production', () => {
        const origEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const req = mockReq();
        const res = mockRes();
        const next = mockNext();

        const err = new Error('secret crash');
        handler(err, req, res as any, next);

        expect((res._body as any).stack).toBeUndefined();
        process.env.NODE_ENV = origEnv;
    });

    it('should handle Prisma P2002 unique constraint error', () => {
        const req = mockReq();
        const res = mockRes();
        const next = mockNext();

        // Simulate Prisma known request error
        const err: any = new Error('Unique constraint');
        err.code = 'P2002';
        err.name = 'PrismaClientKnownRequestError';

        handler(err, req, res as any, next);

        expect(res._status).toBe(409);
        expect((res._body as any).error).toContain('already exists');
    });

    it('should handle Prisma P2025 record not found error', () => {
        const req = mockReq();
        const res = mockRes();
        const next = mockNext();

        const err: any = new Error('Record not found');
        err.code = 'P2025';
        err.name = 'PrismaClientKnownRequestError';

        handler(err, req, res as any, next);

        expect(res._status).toBe(404);
    });

    it('should handle string errors', () => {
        const req = mockReq();
        const res = mockRes();
        const next = mockNext();

        handler('something broke' as any, req, res as any, next);

        expect(res._status).toBe(500);
    });
});
