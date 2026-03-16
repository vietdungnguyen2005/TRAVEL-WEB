"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyRequestsError = exports.ServiceUnavailableError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    constructor(statusCode, message, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(resource) {
        super(404, `${resource} not found`, 'NOT_FOUND');
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends AppError {
    constructor(message, details) {
        super(400, message, 'VALIDATION_ERROR');
        this.details = details;
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(401, message, 'UNAUTHORIZED');
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(403, message, 'FORBIDDEN');
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends AppError {
    constructor(message) {
        super(409, message, 'CONFLICT');
    }
}
exports.ConflictError = ConflictError;
class ServiceUnavailableError extends AppError {
    constructor(message = 'Service temporarily unavailable') {
        super(503, message, 'SERVICE_UNAVAILABLE');
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests, please try again later') {
        super(429, message, 'TOO_MANY_REQUESTS');
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
