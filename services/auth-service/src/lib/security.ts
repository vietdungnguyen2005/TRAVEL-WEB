// Security utilities and constants

// Rate limiting configuration
export const RATE_LIMITS = {
    LOGIN_ATTEMPTS: {
        MAX_ATTEMPTS: 5,
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    },
    API_REQUESTS: {
        MAX_REQUESTS: 100,
        WINDOW_MS: 60 * 1000, // 1 minute
    },
    FILE_UPLOAD: {
        MAX_REQUESTS: 10,
        WINDOW_MS: 60 * 1000, // 1 minute
    },
};

// File upload restrictions
export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

// Password requirements
export const PASSWORD_REQUIREMENTS = {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL: false,
};

// Session configuration
export const SESSION_CONFIG = {
    MAX_AGE: 30 * 24 * 60 * 60, // 30 days
    UPDATE_AGE: 24 * 60 * 60, // 1 day
};

// Input sanitization
export function sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';

    // Remove potential XSS characters
    return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
}

// Validate email format
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number (Vietnamese format)
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+84|0)(3|5|7|8|9)\d{8}$/;
    return phoneRegex.test(phone);
}
