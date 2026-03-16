import { describe, it, expect } from 'vitest';
import {
    AppError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    TooManyRequestsError,
} from '../errors';

describe('AppError', () => {
    it('should create with statusCode, message, and code', () => {
        const err = new AppError(400, 'Bad input', 'BAD_INPUT');
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(AppError);
        expect(err.statusCode).toBe(400);
        expect(err.message).toBe('Bad input');
        expect(err.code).toBe('BAD_INPUT');
        expect(err.name).toBe('AppError');
    });

    it('should work without code', () => {
        const err = new AppError(500, 'oops');
        expect(err.code).toBeUndefined();
    });
});

describe('NotFoundError', () => {
    it('should default to 404 with resource name', () => {
        const err = new NotFoundError('Room');
        expect(err.statusCode).toBe(404);
        expect(err.message).toBe('Room not found');
        expect(err.code).toBe('NOT_FOUND');
    });
});

describe('ValidationError', () => {
    it('should carry details object', () => {
        const details = { email: ['invalid format'] };
        const err = new ValidationError('Validation failed', details);
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('VALIDATION_ERROR');
        expect(err.details).toEqual(details);
    });

    it('should work without details', () => {
        const err = new ValidationError('Bad data');
        expect(err.details).toBeUndefined();
    });
});

describe('UnauthorizedError', () => {
    it('should default to 401 with default message', () => {
        const err = new UnauthorizedError();
        expect(err.statusCode).toBe(401);
        expect(err.message).toBe('Unauthorized');
    });

    it('should accept custom message', () => {
        const err = new UnauthorizedError('Token expired');
        expect(err.message).toBe('Token expired');
    });
});

describe('ForbiddenError', () => {
    it('should default to 403', () => {
        const err = new ForbiddenError();
        expect(err.statusCode).toBe(403);
        expect(err.message).toBe('Forbidden');
    });
});

describe('ConflictError', () => {
    it('should default to 409', () => {
        const err = new ConflictError('Room already booked');
        expect(err.statusCode).toBe(409);
        expect(err.code).toBe('CONFLICT');
    });
});

describe('TooManyRequestsError', () => {
    it('should default to 429', () => {
        const err = new TooManyRequestsError();
        expect(err.statusCode).toBe(429);
        expect(err.message).toBe('Too many requests, please try again later');
    });
});
