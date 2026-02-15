"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.verifyToken = verifyToken;
exports.refresh = refresh;
exports.logoutAll = logoutAll;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const zod_1 = require("zod");
const prisma_1 = require("../../lib/prisma");
const jwt_rs256_1 = require("../../lib/jwt.rs256");
const refresh_tokens_1 = require("../../lib/refresh-tokens");
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
function requireEmailVerification() {
    return process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
}
function authCookieOptions(maxAgeMs) {
    const isProd = process.env.NODE_ENV === 'production';
    const envSameSite = (process.env.AUTH_COOKIE_SAMESITE || 'lax').toLowerCase();
    const sameSite = (envSameSite === 'strict' ? 'strict' : envSameSite === 'lax' ? 'lax' : 'lax');
    return {
        httpOnly: true,
        // Production cookies must be Secure (served only over HTTPS)
        secure: isProd ? true : false,
        sameSite,
        path: '/',
        ...(typeof maxAgeMs === 'number' ? { maxAge: maxAgeMs } : {}),
    };
}
function setAuthCookie(res, token) {
    // Keep backwards compatibility: API returns `token`, but we also set it as httpOnly cookie.
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
async function register(req, res) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Dữ liệu không hợp lệ',
            errors: parsed.error.flatten().fieldErrors,
        });
    }
    const email = parsed.data.email.toLowerCase().trim();
    const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ message: 'Email đã được sử dụng' });
    }
    const hashed = await bcrypt_1.default.hash(parsed.data.password, 10);
    // Email verification token (for production you'd send it via email)
    const verificationToken = (0, crypto_1.randomBytes)(24).toString('hex');
    const mustVerify = requireEmailVerification();
    const user = await prisma_1.prisma.user.create({
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
    const accessToken = (0, jwt_rs256_1.signAccessToken)({ userId: user.id, role: user.role });
    const refresh = await (0, refresh_tokens_1.issueRefreshToken)({
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
async function login(req, res) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Dữ liệu không hợp lệ',
            errors: parsed.error.flatten().fieldErrors,
        });
    }
    const email = parsed.data.email.toLowerCase().trim();
    const user = await prisma_1.prisma.user.findUnique({
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
    const ok = await bcrypt_1.default.compare(parsed.data.password, user.password);
    if (!ok) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    const accessToken = (0, jwt_rs256_1.signAccessToken)({ userId: user.id, role: user.role });
    const refresh = await (0, refresh_tokens_1.issueRefreshToken)({
        userId: user.id,
        ip: req.ip,
        userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
    });
    setAuthCookie(res, accessToken);
    setRefreshCookie(res, refresh.token);
    const { password: _pw, ...safeUser } = user;
    return res.status(200).json({
        message: 'Đăng nhập thành công',
        accessToken,
        user: safeUser,
    });
}
async function verifyToken(req, res) {
    const schema = zod_1.z.object({ token: zod_1.z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'token is required' });
    }
    try {
        const payload = (0, jwt_rs256_1.verifyAccessTokenOrThrow)(parsed.data.token);
        return res.status(200).json({ verified: true, payload });
    }
    catch {
        return res.status(401).json({ verified: false });
    }
}
async function refresh(req, res) {
    const bodySchema = zod_1.z.object({ refreshToken: zod_1.z.string().min(1).optional() });
    const parsed = bodySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
    const cookieToken = typeof req.cookies?.refresh_token === 'string' ? req.cookies.refresh_token : undefined;
    const bodyToken = parsed.data.refreshToken;
    const token = cookieToken ?? bodyToken;
    if (!token)
        return res.status(401).json({ message: 'Unauthorized' });
    const rotated = await (0, refresh_tokens_1.rotateRefreshToken)({
        refreshToken: token,
        ip: req.ip,
        userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
    });
    if (!rotated.ok) {
        clearAuthCookies(res);
        return res.status(401).json({ message: 'Unauthorized', code: rotated.reason });
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: rotated.userId },
        select: { id: true, email: true, name: true, role: true, isVerified: true },
    });
    if (!user) {
        clearAuthCookies(res);
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const accessToken = (0, jwt_rs256_1.signAccessToken)({ userId: user.id, role: user.role });
    setAuthCookie(res, accessToken);
    setRefreshCookie(res, rotated.refresh.token);
    return res.status(200).json({ accessToken, user });
}
async function logoutAll(req, res) {
    const userId = typeof req.user?.id === 'string' ? req.user.id : undefined;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    await (0, refresh_tokens_1.revokeAllUserRefreshTokens)(userId);
    clearAuthCookies(res);
    return res.status(200).json({ success: true });
}
//# sourceMappingURL=auth.controller.js.map