"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = exports.ValidationError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    constructor(statusCode, message, code) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
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
    constructor(message) {
        super(400, message, 'VALIDATION_ERROR');
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(401, message, 'UNAUTHORIZED');
    }
}
exports.UnauthorizedError = UnauthorizedError;
