import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { signAccessToken, verifyAccessTokenOrThrow } from '../../lib/jwt.rs256';
import { issueRefreshToken, rotateRefreshToken, revokeAllUserRefreshTokens } from '../../lib/refresh-tokens';

const registerSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

function requireEmailVerification() {
    return process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
}

function authCookieOptions(maxAgeMs?: number) {
    const isProd = process.env.NODE_ENV === 'production';

    const envSameSite = (process.env.AUTH_COOKIE_SAMESITE || 'lax').toLowerCase();
    const sameSite = (envSameSite === 'strict' ? 'strict' : envSameSite === 'lax' ? 'lax' : 'lax') as 'strict' | 'lax';

    return {
        httpOnly: true,
        // Production cookies must be Secure (served only over HTTPS)
        secure: isProd ? true : false,
        sameSite,
        path: '/',
        ...(typeof maxAgeMs === 'number' ? { maxAge: maxAgeMs } : {}),
    };
}

function setAuthCookie(res: Response, token: string) {
    // Keep backwards compatibility: API returns `token`, but we also set it as httpOnly cookie.
    const accessMaxAgeMs = Number(process.env.ACCESS_COOKIE_MAX_AGE_MS || 15 * 60 * 1000);
    res.cookie('access_token', token, authCookieOptions(accessMaxAgeMs));
}

function setRefreshCookie(res: Response, token: string) {
    const refreshMaxAgeMs = Number(process.env.REFRESH_COOKIE_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000);
    res.cookie('refresh_token', token, authCookieOptions(refreshMaxAgeMs));
}

function clearAuthCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
}

export async function register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Dữ liệu không hợp lệ',
            errors: parsed.error.flatten().fieldErrors,
        });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ message: 'Email đã được sử dụng' });
    }

    const hashed = await bcrypt.hash(parsed.data.password, 10);

    // Email verification token (for production you'd send it via email)
    const verificationToken = randomBytes(24).toString('hex');

    const mustVerify = requireEmailVerification();

    const user = await prisma.user.create({
        data: {
            email,
            password: hashed,
            name: parsed.data.name,
            role: 'CUSTOMER',
            isVerified: mustVerify ? false : true,
            verificationToken: mustVerify ? verificationToken : null,
        },
        select: { id: true, email: true, name: true, role: true, isVerified: true },
    });

    // Production default: allow issuing tokens after registration (as requested).
    // If REQUIRE_EMAIL_VERIFICATION=true, return without tokens.
    if (mustVerify) {
        return res.status(201).json({
            message: 'Đăng ký thành công. Vui lòng xác nhận email để kích hoạt tài khoản.',
            user,
            verificationToken,
        });
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refresh = await issueRefreshToken({
        userId: user.id,
        ip: req.ip,
        userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
    });

    setAuthCookie(res, accessToken);
    setRefreshCookie(res, refresh.token);

    return res.status(201).json({
        message: 'Đăng ký thành công',
        accessToken,
        user,
    });
}

export async function login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Dữ liệu không hợp lệ',
            errors: parsed.error.flatten().fieldErrors,
        });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, role: true, isVerified: true, password: true },
    });

    if (!user) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    if (requireEmailVerification() && !user.isVerified) {
        return res.status(403).json({
            message: 'Tài khoản chưa xác nhận email',
            code: 'EMAIL_NOT_VERIFIED',
        });
    }

    const ok = await bcrypt.compare(parsed.data.password, user.password);
    if (!ok) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refresh = await issueRefreshToken({
        userId: user.id,
        ip: req.ip,
        userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
    });

    setAuthCookie(res, accessToken);
    setRefreshCookie(res, refresh.token);

    const { password: _pw, ...safeUser } = user;
    void _pw;

    return res.status(200).json({
        message: 'Đăng nhập thành công',
        accessToken,
        user: safeUser,
    });
}

export async function verifyToken(req: Request, res: Response) {
    const schema = z.object({ token: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'token is required' });
    }

    try {
        const payload = verifyAccessTokenOrThrow(parsed.data.token);
        return res.status(200).json({ verified: true, payload });
    } catch {
        return res.status(401).json({ verified: false });
    }
}

export async function refresh(req: Request, res: Response) {
    const bodySchema = z.object({ refreshToken: z.string().min(1).optional() });
    const parsed = bodySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }

    const cookies = (req as Request & { cookies?: Record<string, unknown> }).cookies;
    const cookieToken = typeof cookies?.refresh_token === 'string' ? cookies.refresh_token : undefined;
    const bodyToken = parsed.data.refreshToken;
    const token = cookieToken ?? bodyToken;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const rotated = await rotateRefreshToken({
        refreshToken: token,
        ip: req.ip,
        userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
    });

    if (!rotated.ok) {
        clearAuthCookies(res);
        return res.status(401).json({ message: 'Unauthorized', code: rotated.reason });
    }

    const user = await prisma.user.findUnique({
        where: { id: rotated.userId },
        select: { id: true, email: true, name: true, role: true, isVerified: true },
    });

    if (!user) {
        clearAuthCookies(res);
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    setAuthCookie(res, accessToken);
    setRefreshCookie(res, rotated.refresh.token);

    return res.status(200).json({ accessToken, user });
}

export async function logoutAll(req: Request, res: Response) {
    const user = (req as Request & { user?: Record<string, unknown> }).user;
    const userId = typeof user?.id === 'string' ? user.id : undefined;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await revokeAllUserRefreshTokens(userId);
    clearAuthCookies(res);
    return res.status(200).json({ success: true });
}
