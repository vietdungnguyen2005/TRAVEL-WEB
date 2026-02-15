import type { Request, Response } from 'express';
import { z } from 'zod';
import { AuthError } from '../../../application/auth/auth.errors';
import { LoginUseCase } from '../../../application/auth/usecases/login.usecase';
import { RegisterUseCase } from '../../../application/auth/usecases/register.usecase';
import { RefreshUseCase } from '../../../application/auth/usecases/refresh.usecase';
import { LogoutAllUseCase } from '../../../application/auth/usecases/logout-all.usecase';
import { PrismaUserRepository } from '../../../infrastructure/prisma/user.prisma.repository';
import { PrismaRefreshTokenRepository } from '../../../infrastructure/prisma/refresh-token.prisma.repository';
import { Rs256JwtService } from '../../../infrastructure/jwt/rs256.jwt.service';
import { BcryptPasswordHasher } from '../../../infrastructure/crypto/bcrypt.password-hasher';

function requireEmailVerification() {
    return process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
}

function authCookieOptions(maxAgeMs?: number) {
    const isProd = process.env.NODE_ENV === 'production';

    const envSameSite = (process.env.AUTH_COOKIE_SAMESITE || 'lax').toLowerCase();
    const sameSite = (envSameSite === 'strict' ? 'strict' : envSameSite === 'lax' ? 'lax' : 'lax') as 'strict' | 'lax';

    return {
        httpOnly: true,
        secure: isProd ? true : false,
        sameSite,
        path: '/',
        ...(typeof maxAgeMs === 'number' ? { maxAge: maxAgeMs } : {}),
    };
}

function setAccessCookie(res: Response, token: string) {
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

function getClientIp(req: Request) {
    return req.ip;
}

function getUserAgent(req: Request) {
    return typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
}

function mapAuthError(err: unknown, res: Response) {
    if (err instanceof AuthError) {
        if (err.code === 'EMAIL_IN_USE') return res.status(409).json({ message: err.message });
        if (err.code === 'EMAIL_NOT_VERIFIED') return res.status(403).json({ message: err.message, code: 'EMAIL_NOT_VERIFIED' });
        if (err.code === 'INVALID_CREDENTIALS') return res.status(401).json({ message: err.message });
        if (err.code === 'UNAUTHORIZED') return res.status(401).json({ message: 'Unauthorized' });
        return res.status(400).json({ message: err.message });
    }

    if (err instanceof Error) {
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }

    return res.status(500).json({ message: 'Internal server error' });
}

const deps = {
    users: new PrismaUserRepository(),
    refreshTokens: new PrismaRefreshTokenRepository(),
    jwt: new Rs256JwtService(),
    passwordHasher: new BcryptPasswordHasher(Number(process.env.BCRYPT_SALT_ROUNDS || 10)),
};

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

export async function register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: parsed.error.flatten().fieldErrors });
    }

    try {
        const uc = new RegisterUseCase(deps);
        const result = await uc.execute({
            name: parsed.data.name,
            email: parsed.data.email,
            password: parsed.data.password,
            ip: getClientIp(req),
            userAgent: getUserAgent(req),
            requireEmailVerification: requireEmailVerification(),
        });

        if (result.status === 'NEEDS_EMAIL_VERIFICATION') {
            return res.status(201).json({
                message: 'Đăng ký thành công. Vui lòng xác nhận email để kích hoạt tài khoản.',
                user: result.user,
                verificationToken: result.verificationToken,
            });
        }

        setAccessCookie(res, result.accessToken);
        setRefreshCookie(res, result.refreshToken);

        return res.status(201).json({ message: 'Đăng ký thành công', accessToken: result.accessToken, user: result.user });
    } catch (err) {
        return mapAuthError(err, res);
    }
}

export async function login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: parsed.error.flatten().fieldErrors });
    }

    try {
        const uc = new LoginUseCase(deps);
        const result = await uc.execute({
            email: parsed.data.email,
            password: parsed.data.password,
            ip: getClientIp(req),
            userAgent: getUserAgent(req),
            requireEmailVerification: requireEmailVerification(),
        });

        setAccessCookie(res, result.accessToken);
        setRefreshCookie(res, result.refreshToken);

        return res.status(200).json({ message: 'Đăng nhập thành công', accessToken: result.accessToken, user: result.user });
    } catch (err) {
        return mapAuthError(err, res);
    }
}

export async function refresh(req: Request, res: Response) {
    const bodySchema = z.object({ refreshToken: z.string().min(1).optional() });
    const parsed = bodySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }

    const cookieToken = typeof (req as any).cookies?.refresh_token === 'string' ? (req as any).cookies.refresh_token : undefined;
    const token = cookieToken ?? parsed.data.refreshToken;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const uc = new RefreshUseCase(deps);
        const result = await uc.execute({ refreshToken: token, ip: getClientIp(req), userAgent: getUserAgent(req) });

        setAccessCookie(res, result.accessToken);
        setRefreshCookie(res, result.refreshToken);

        return res.status(200).json({ accessToken: result.accessToken, user: result.user });
    } catch (err) {
        clearAuthCookies(res);
        return mapAuthError(err, res);
    }
}

export async function logoutAll(req: Request, res: Response) {
    const userId = typeof (req as any).user?.id === 'string' ? (req as any).user.id : undefined;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const uc = new LogoutAllUseCase(deps);
        await uc.execute({ userId });
        clearAuthCookies(res);
        return res.status(200).json({ success: true });
    } catch (err) {
        return mapAuthError(err, res);
    }
}
