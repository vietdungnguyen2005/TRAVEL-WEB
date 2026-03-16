import { Logger } from '../logger';

/**
 * Environment variable validation.
 *
 * Call at service startup to catch missing / invalid env vars early
 * instead of getting cryptic errors at runtime.
 */

export type EnvRule = {
    /** Environment variable name */
    name: string;
    /** If true, service will not start without this var */
    required?: boolean;
    /** Default value when not required and missing */
    default?: string;
    /** Regex the value must match */
    pattern?: RegExp;
    /** Human-readable description (shown in error messages) */
    description?: string;
};

export type ValidateEnvOptions = {
    /** Name of the service (for log messages) */
    serviceName: string;
    /** List of env var rules */
    rules: EnvRule[];
    /** If true, process.exit(1) on validation failure (default: true) */
    exitOnError?: boolean;
};

/**
 * Common env rules shared by most services.
 * Services can spread these and add their own.
 */
export const COMMON_ENV_RULES: EnvRule[] = [
    { name: 'PORT', required: false, default: '3000', description: 'HTTP port' },
    { name: 'DATABASE_URL', required: true, description: 'Prisma database connection string' },
    { name: 'RABBITMQ_URL', required: false, description: 'RabbitMQ connection URL' },
];

export const AUTH_SERVICE_ENV_RULES: EnvRule[] = [
    ...COMMON_ENV_RULES,
    // RS256 keys are optional – when absent the JWT lib falls back to HS256 with JWT_SECRET.
    // The env var names must match what jwt.rs256.ts actually reads.
    { name: 'JWT_PRIVATE_KEY', required: false, description: 'RS256 private key for JWT signing (optional; falls back to HS256)' },
    { name: 'JWT_PUBLIC_KEY', required: false, description: 'RS256 public key for JWT verification (optional; falls back to HS256)' },
    { name: 'JWT_SECRET', required: false, description: 'HS256 secret (required when RS256 keys are not set)' },
    { name: 'JWT_ACCESS_EXPIRES_IN', required: false, default: '15m', description: 'Access token TTL' },
    { name: 'JWT_REFRESH_EXPIRES_IN', required: false, default: '7d', description: 'Refresh token TTL' },
    { name: 'REDIS_URL', required: false, description: 'Redis URL for token blacklist' },
    { name: 'GOOGLE_CLIENT_ID', required: false, description: 'Google OAuth client ID' },
    { name: 'GOOGLE_CLIENT_SECRET', required: false, description: 'Google OAuth client secret' },
];

export const BOOKING_SERVICE_ENV_RULES: EnvRule[] = [
    ...COMMON_ENV_RULES,
    { name: 'RABBITMQ_URL', required: true, description: 'RabbitMQ connection URL' },
];

export const PAYMENT_SERVICE_ENV_RULES: EnvRule[] = [
    ...COMMON_ENV_RULES,
    { name: 'RABBITMQ_URL', required: true, description: 'RabbitMQ connection URL' },
    { name: 'VNPAY_TMN_CODE', required: true, description: 'VNPay terminal code' },
    { name: 'VNPAY_SECURE_SECRET', required: true, description: 'VNPay HMAC secret' },
];

export const ROOM_SERVICE_ENV_RULES: EnvRule[] = [
    ...COMMON_ENV_RULES,
    { name: 'RABBITMQ_URL', required: false, description: 'RabbitMQ URL for event publishing' },
];

export const REVIEW_SERVICE_ENV_RULES: EnvRule[] = [
    ...COMMON_ENV_RULES,
];

export const NOTIFICATION_SERVICE_ENV_RULES: EnvRule[] = [
    { name: 'PORT', required: false, default: '3006', description: 'HTTP port' },
    { name: 'RABBITMQ_URL', required: true, description: 'RabbitMQ URL for consuming events' },
    { name: 'SMTP_HOST', required: false, description: 'SMTP host for sending emails' },
    { name: 'SMTP_USER', required: false, description: 'SMTP username' },
    { name: 'SMTP_PASS', required: false, description: 'SMTP password' },
];

export const BLOG_SERVICE_ENV_RULES: EnvRule[] = [
    ...COMMON_ENV_RULES,
];

export const CONTENT_SERVICE_ENV_RULES: EnvRule[] = [
    { name: 'PORT', required: false, default: '3007', description: 'HTTP port' },
    { name: 'DATABASE_URL', required: true, description: 'Prisma database connection string' },
];

export const GATEWAY_ENV_RULES: EnvRule[] = [
    { name: 'PORT', required: false, default: '4000', description: 'Gateway port' },
    { name: 'REDIS_URL', required: false, description: 'Redis URL for rate limiting store' },
    { name: 'JWKS_URL', required: false, description: 'JWKS endpoint for JWT validation' },
];

/**
 * Validate environment variables at service startup.
 *
 * @returns Object with `valid` flag and list of `errors`
 */
export function validateEnv(options: ValidateEnvOptions): { valid: boolean; errors: string[] } {
    const logger = new Logger(options.serviceName);
    const errors: string[] = [];
    const exitOnError = options.exitOnError ?? true;

    for (const rule of options.rules) {
        const value = process.env[rule.name];

        if (!value && rule.required) {
            const desc = rule.description ? ` (${rule.description})` : '';
            errors.push(`Missing required env var: ${rule.name}${desc}`);
            continue;
        }

        // Apply default
        if (!value && rule.default !== undefined) {
            process.env[rule.name] = rule.default;
        }

        // Pattern validation
        if (value && rule.pattern && !rule.pattern.test(value)) {
            errors.push(
                `Env var ${rule.name} has invalid format. ` +
                `Expected: ${rule.pattern.toString()}` +
                (rule.description ? ` (${rule.description})` : '')
            );
        }
    }

    if (errors.length > 0) {
        logger.error('❌ Environment validation failed:', { errors });
        for (const err of errors) {
            logger.error(`  → ${err}`);
        }

        if (exitOnError) {
            logger.error('Service will not start. Fix the above env vars and restart.');
            process.exit(1);
        }
    } else {
        logger.info('✅ Environment validation passed', {
            varsChecked: options.rules.length,
        });
    }

    return { valid: errors.length === 0, errors };
}
