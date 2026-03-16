export declare class AppError extends Error {
    statusCode: number;
    code?: string;
    constructor(statusCode: number, message: string, code?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string);
}
export declare class ValidationError extends AppError {
    details?: Record<string, string[]>;
    constructor(message: string, details?: Record<string, string[]>);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string);
}
export declare class ServiceUnavailableError extends AppError {
    constructor(message?: string);
}
export declare class TooManyRequestsError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map