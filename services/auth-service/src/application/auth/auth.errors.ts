export class AuthError extends Error {
    constructor(
        message: string,
        public readonly code:
            | 'EMAIL_IN_USE'
            | 'INVALID_CREDENTIALS'
            | 'EMAIL_NOT_VERIFIED'
            | 'UNAUTHORIZED'
            | 'VALIDATION_ERROR'
    ) {
        super(message);
    }
}
