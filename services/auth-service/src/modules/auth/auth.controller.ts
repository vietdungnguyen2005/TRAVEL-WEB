import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

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

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');
    return secret;
}

function signAccessToken(payload: { sub: string; email: string; role: string }) {
    const secret = getJwtSecret();
    const opts: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '7d',
    };
    return jwt.sign(payload, secret, opts);
}

function authCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';

    const envSameSite = (process.env.AUTH_COOKIE_SAMESITE || 'lax').toLowerCase();
    const sameSite = (envSameSite === 'strict' ? 'strict' : envSameSite === 'lax' ? 'lax' : 'lax') as 'strict' | 'lax';

    return {
        httpOnly: true,
        // Production cookies must be Secure (served only over HTTPS)
        secure: isProd ? true : false,
        sameSite,
        path: '/',
        // Express expects milliseconds
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
}

function setAuthCookie(res: Response, token: string) {
    // Keep backwards compatibility: API returns `token`, but we also set it as httpOnly cookie.
    res.cookie('access_token', token, authCookieOptions());
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

    const user = await prisma.user.create({
        data: {
            email,
            password: hashed,
            name: parsed.data.name,
            role: 'CUSTOMER',
            isVerified: false,
            verificationToken,
        },
        select: { id: true, email: true, name: true, role: true, isVerified: true },
    });

    const accessToken = signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
    });

    setAuthCookie(res, accessToken);

    return res.status(201).json({
        message: 'Đăng ký thành công',
        token: accessToken,
        user,
        // For dev/testing we return token so UI can show/copy it.
        // In production this should be emailed.
        verificationToken,
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

    if (!user.isVerified) {
        return res.status(403).json({
            message: 'Tài khoản chưa xác nhận email',
            code: 'EMAIL_NOT_VERIFIED',
        });
    }

    const ok = await bcrypt.compare(parsed.data.password, user.password);
    if (!ok) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const accessToken = signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
    });

    setAuthCookie(res, accessToken);

    const { password: _pw, ...safeUser } = user;

    return res.status(200).json({
        message: 'Đăng nhập thành công',
        token: accessToken,
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
        const payload = jwt.verify(parsed.data.token, getJwtSecret()) as unknown;
        return res.status(200).json({ verified: true, payload });
    } catch {
        return res.status(401).json({ verified: false });
    }
}
