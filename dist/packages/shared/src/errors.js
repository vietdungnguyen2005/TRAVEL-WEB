export class AppError extends Error {
    statusCode;
    message;
    code;
    constructor(statusCode, message, code) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.code = code;
        this.name = 'AppError';
    }
}
export class NotFoundError extends AppError {
    constructor(resource) {
        super(404, `${resource} not found`, 'NOT_FOUND');
    }
}
export class ValidationError extends AppError {
    constructor(message) {
        super(400, message, 'VALIDATION_ERROR');
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(401, message, 'UNAUTHORIZED');
    }
}
//# sourceMappingURL=errors.js.map