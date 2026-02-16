"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logoutAll = logoutAll;
const zod_1 = require("zod");
const auth_errors_1 = require("../../../application/auth/auth.errors");
const login_usecase_1 = require("../../../application/auth/usecases/login.usecase");
const register_usecase_1 = require("../../../application/auth/usecases/register.usecase");
const refresh_usecase_1 = require("../../../application/auth/usecases/refresh.usecase");
const logout_all_usecase_1 = require("../../../application/auth/usecases/logout-all.usecase");
const user_prisma_repository_1 = require("../../../infrastructure/prisma/user.prisma.repository");
const refresh_token_prisma_repository_1 = require("../../../infrastructure/prisma/refresh-token.prisma.repository");
const rs256_jwt_service_1 = require("../../../infrastructure/jwt/rs256.jwt.service");
const bcrypt_password_hasher_1 = require("../../../infrastructure/crypto/bcrypt.password-hasher");
const email_verification_prisma_repository_1 = require("../../../infrastructure/prisma/email-verification.prisma.repository");
const nodemailer_email_service_1 = require("../../../infrastructure/email/nodemailer.email.service");
function requireEmailVerification() {
    return process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
}
function authCookieOptions(maxAgeMs) {
    const isProd = process.env.NODE_ENV === 'production';
    const envSameSite = (process.env.AUTH_COOKIE_SAMESITE || 'lax').toLowerCase();
    const sameSite = (envSameSite === 'strict' ? 'strict' : envSameSite === 'lax' ? 'lax' : 'lax');
    return {
        httpOnly: true,
        secure: isProd ? true : false,
        sameSite,
        path: '/',
        ...(typeof maxAgeMs === 'number' ? { maxAge: maxAgeMs } : {}),
    };
}
function setAccessCookie(res, token) {
    const accessMaxAgeMs = Number(process.env.ACCESS_COOKIE_MAX_AGE_MS || 15 * 60 * 1000);
    res.cookie('access_token', token, authCookieOptions(accessMaxAgeMs));
}
function setRefreshCookie(res, token) {
    const refreshMaxAgeMs = Number(process.env.REFRESH_COOKIE_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000);
    res.cookie('refresh_token', token, authCookieOptions(refreshMaxAgeMs));
}
function clearAuthCookies(res) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
}
function getClientIp(req) {
    return req.ip;
}
function getUserAgent(req) {
    return typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
}
function mapAuthError(err, res) {
    if (err instanceof auth_errors_1.AuthError) {
        if (err.code === 'EMAIL_IN_USE')
            return res.status(409).json({ message: err.message });
        if (err.code === 'EMAIL_NOT_VERIFIED')
            return res.status(403).json({ message: err.message, code: 'EMAIL_NOT_VERIFIED' });
        if (err.code === 'INVALID_CREDENTIALS')
            return res.status(401).json({ message: err.message });
        if (err.code === 'UNAUTHORIZED')
            return res.status(401).json({ message: 'Unauthorized' });
        return res.status(400).json({ message: err.message });
    }
    if (err instanceof Error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(500).json({ message: 'Internal server error' });
}
const deps = {
    users: new user_prisma_repository_1.PrismaUserRepository(),
    refreshTokens: new refresh_token_prisma_repository_1.PrismaRefreshTokenRepository(),
    jwt: new rs256_jwt_service_1.Rs256JwtService(),
    passwordHasher: new bcrypt_password_hasher_1.BcryptPasswordHasher(Number(process.env.BCRYPT_SALT_ROUNDS || 10)),
    emailVerifications: new email_verification_prisma_repository_1.PrismaEmailVerificationRepository(),
    email: new nodemailer_email_service_1.NodemailerEmailService(),
    webAppUrl: (process.env.WEB_APP_URL || '').replace(/\/+$/, '') || undefined,
};
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    phone: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
async function register(req, res) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: parsed.error.flatten().fieldErrors });
    }
    try {
        const uc = new register_usecase_1.RegisterUseCase(deps);
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
                needsEmailVerification: true,
            });
        }
        setAccessCookie(res, result.accessToken);
        setRefreshCookie(res, result.refreshToken);
        return res.status(201).json({ message: 'Đăng ký thành công', accessToken: result.accessToken, user: result.user });
    }
    catch (err) {
        return mapAuthError(err, res);
    }
}
async function login(req, res) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: parsed.error.flatten().fieldErrors });
    }
    try {
        const uc = new login_usecase_1.LoginUseCase(deps);
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
    }
    catch (err) {
        return mapAuthError(err, res);
    }
}
async function refresh(req, res) {
    const bodySchema = zod_1.z.object({ refreshToken: zod_1.z.string().min(1).optional() });
    const parsed = bodySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
    const cookies = req.cookies;
    const cookieToken = typeof cookies?.refresh_token === 'string' ? cookies.refresh_token : undefined;
    const token = cookieToken ?? parsed.data.refreshToken;
    if (!token)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const uc = new refresh_usecase_1.RefreshUseCase(deps);
        const result = await uc.execute({ refreshToken: token, ip: getClientIp(req), userAgent: getUserAgent(req) });
        setAccessCookie(res, result.accessToken);
        setRefreshCookie(res, result.refreshToken);
        return res.status(200).json({ accessToken: result.accessToken, user: result.user });
    }
    catch (err) {
        clearAuthCookies(res);
        return mapAuthError(err, res);
    }
}
async function logoutAll(req, res) {
    const user = req.user;
    const userId = typeof user?.id === 'string' ? user.id : undefined;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const uc = new logout_all_usecase_1.LogoutAllUseCase(deps);
        await uc.execute({ userId });
        clearAuthCookies(res);
        return res.status(200).json({ success: true });
    }
    catch (err) {
        return mapAuthError(err, res);
    }
}
//# sourceMappingURL=auth.controller.js.map