export declare const RATE_LIMITS: {
    LOGIN_ATTEMPTS: {
        MAX_ATTEMPTS: number;
        WINDOW_MS: number;
    };
    API_REQUESTS: {
        MAX_REQUESTS: number;
        WINDOW_MS: number;
    };
    FILE_UPLOAD: {
        MAX_REQUESTS: number;
        WINDOW_MS: number;
    };
};
export declare const FILE_UPLOAD: {
    MAX_SIZE: number;
    ALLOWED_IMAGE_TYPES: string[];
    ALLOWED_MIME_TYPES: string[];
};
export declare const PASSWORD_REQUIREMENTS: {
    MIN_LENGTH: number;
    REQUIRE_UPPERCASE: boolean;
    REQUIRE_LOWERCASE: boolean;
    REQUIRE_NUMBERS: boolean;
    REQUIRE_SPECIAL: boolean;
};
export declare const SESSION_CONFIG: {
    MAX_AGE: number;
    UPDATE_AGE: number;
};
export declare function sanitizeInput(input: string): string;
export declare function isValidEmail(email: string): boolean;
export declare function isValidPhone(phone: string): boolean;
//# sourceMappingURL=security.d.ts.map