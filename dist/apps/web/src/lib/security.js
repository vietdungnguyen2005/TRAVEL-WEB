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
export function sanitizeInput(input) {
    if (typeof input !== 'string')
        return '';
    // Remove potential XSS characters
    return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
}
// Validate email format
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// Validate phone number (Vietnamese format)
export function isValidPhone(phone) {
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}
// Check password strength
export function validatePasswordStrength(password) {
    const errors = [];
    if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
        errors.push(`Mật khẩu phải có ít nhất ${PASSWORD_REQUIREMENTS.MIN_LENGTH} ký tự`);
    }
    if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
    }
    if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
    }
    if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBERS && !/[0-9]/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 chữ số');
    }
    if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL && !/[!@#$%^&*]/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
// Sanitize HTML to prevent XSS
export function sanitizeHtml(html) {
    if (typeof html !== 'string')
        return '';
    return html
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}
// Check if user agent is suspicious
export function isSuspiciousUserAgent(userAgent) {
    if (!userAgent)
        return true;
    const suspiciousPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
    ];
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}
// Generate secure random token
export function generateSecureToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const randomValues = new Uint8Array(length);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(randomValues);
        for (let i = 0; i < length; i++) {
            token += chars[randomValues[i] % chars.length];
        }
    }
    else {
        // Fallback for Node.js
        for (let i = 0; i < length; i++) {
            token += chars[Math.floor(Math.random() * chars.length)];
        }
    }
    return token;
}
// Validate booking dates
export function validateBookingDates(checkIn, checkOut) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkIn < today) {
        return { valid: false, error: 'Check-in date cannot be in the past' };
    }
    if (checkOut <= checkIn) {
        return { valid: false, error: 'Check-out date must be after check-in date' };
    }
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (checkIn > maxDate) {
        return { valid: false, error: 'Check-in date cannot be more than 1 year in advance' };
    }
    const maxStay = 30; // days
    const stayDuration = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);
    if (stayDuration > maxStay) {
        return { valid: false, error: `Maximum stay duration is ${maxStay} days` };
    }
    return { valid: true };
}
// Check if IP is allowed (for rate limiting)
export function isIpAllowed(ip) {
    // Add your IP whitelist/blacklist logic here
    const blacklist = [];
    // Example: blacklist.push('192.168.1.100');
    return !blacklist.includes(ip);
}
//# sourceMappingURL=security.js.map