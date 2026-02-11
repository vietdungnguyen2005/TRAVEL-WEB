"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.verifyToken = verifyToken;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const zod_1 = require("zod");
const prisma_1 = require("../../lib/prisma");
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
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET is not set');
    return secret;
}
function signAccessToken(payload) {
    const secret = getJwtSecret();
    const opts = {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    };
    return jsonwebtoken_1.default.sign(payload, secret, opts);
}
function authCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    const envSameSite = (process.env.AUTH_COOKIE_SAMESITE || 'lax').toLowerCase();
    const sameSite = (envSameSite === 'strict' ? 'strict' : envSameSite === 'lax' ? 'lax' : 'lax');
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
function setAuthCookie(res, token) {
    // Keep backwards compatibility: API returns `token`, but we also set it as httpOnly cookie.
    res.cookie('access_token', token, authCookieOptions());
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
    const user = await prisma_1.prisma.user.create({
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
    if (!user.isVerified) {
        return res.status(403).json({
            message: 'Tài khoản chưa xác nhận email',
            code: 'EMAIL_NOT_VERIFIED',
        });
    }
    const ok = await bcrypt_1.default.compare(parsed.data.password, user.password);
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
async function verifyToken(req, res) {
    const schema = zod_1.z.object({ token: zod_1.z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'token is required' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(parsed.data.token, getJwtSecret());
        return res.status(200).json({ verified: true, payload });
    }
    catch {
        return res.status(401).json({ verified: false });
    }
}
//# sourceMappingURL=auth.controller.js.map