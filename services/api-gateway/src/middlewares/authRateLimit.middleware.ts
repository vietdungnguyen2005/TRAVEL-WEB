import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request, Response } from 'express';

/**
 * Auth-specific rate limiters.
 *
 * These are stricter than the global limiter and protect
 * sensitive authentication endpoints from brute-force,
 * credential-stuffing, and abuse attacks.
 *
 * Key by IP + path so different auth actions have independent buckets.
 */

function isProd() {
    return process.env.NODE_ENV === 'production';
}

/**
 * Login: 5 attempts / 15 min (prod) — 200 / 15 min (dev)
 * Prevents brute-force password guessing.
 */
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: isProd() ? 5 : 200,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        // Key by IP so attackers can't rotate usernames
        return `login:${ipKeyGenerator(req.ip ?? '')}`;
    },
    message: {
        success: false,
        error: 'Too many login attempts. Please try again after 15 minutes.',
    },
    handler: (_req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            error: 'Too many login attempts. Please try again after 15 minutes.',
        });
    },
});

/**
 * Register: 5 attempts / 1 hour (prod) — 20 / 1 hour (dev)
 * Prevents mass account creation / spam.
 */
export const registerRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: isProd() ? 5 : 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        return `register:${ipKeyGenerator(req.ip ?? '')}`;
    },
    message: {
        success: false,
        error: 'Too many registration attempts. Please try again after 1 hour.',
    },
    handler: (_req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            error: 'Too many registration attempts. Please try again after 1 hour.',
        });
    },
});

/**
 * Forgot-password / reset-password: 3 attempts / 15 min (prod) — 10 / 15 min (dev)
 * Prevents email enumeration & abuse of password reset emails.
 */
export const forgotPasswordRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: isProd() ? 3 : 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        return `forgot-password:${ipKeyGenerator(req.ip ?? '')}`;
    },
    message: {
        success: false,
        error: 'Too many password reset requests. Please try again after 15 minutes.',
    },
    handler: (_req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            error: 'Too many password reset requests. Please try again after 15 minutes.',
        });
    },
});

/**
 * Refresh token: 30 attempts / 15 min (prod) — 100 / 15 min (dev)
 * Slightly more permissive since auto-refresh clients call this regularly.
 */
export const refreshTokenRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: isProd() ? 30 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        return `refresh:${ipKeyGenerator(req.ip ?? '')}`;
    },
    message: {
        success: false,
        error: 'Too many token refresh requests. Please try again later.',
    },
    handler: (_req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            error: 'Too many token refresh requests. Please try again later.',
        });
    },
});

/**
 * OAuth: 10 attempts / 15 min (prod) — 30 / 15 min (dev)
 * Prevents OAuth redirect abuse.
 */
export const oauthRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: isProd() ? 10 : 30,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        return `oauth:${ipKeyGenerator(req.ip ?? '')}`;
    },
    message: {
        success: false,
        error: 'Too many OAuth attempts. Please try again after 15 minutes.',
    },
    handler: (_req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            error: 'Too many OAuth attempts. Please try again after 15 minutes.',
        });
    },
});
