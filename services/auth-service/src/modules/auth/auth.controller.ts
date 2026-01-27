import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
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

export async function register(req: any, res: any) {
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

    const user = await prisma.user.create({
        data: {
            email,
            password: hashed,
            name: parsed.data.name,
            role: 'CUSTOMER',
        },
        select: { id: true, email: true, name: true, role: true, isVerified: true },
    });

    const accessToken = signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
    });

    return res.status(201).json({
        message: 'Đăng ký thành công',
        token: accessToken,
        user,
    });
}

export async function login(req: any, res: any) {
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

    const ok = await bcrypt.compare(parsed.data.password, user.password);
    if (!ok) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const accessToken = signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
    });

    const { password: _pw, ...safeUser } = user;

    return res.status(200).json({
        message: 'Đăng nhập thành công',
        token: accessToken,
        user: safeUser,
    });
}

export async function verifyToken(req: any, res: any) {
    const schema = z.object({ token: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'token is required' });
    }

    try {
        const payload = jwt.verify(parsed.data.token, getJwtSecret()) as any;
        return res.status(200).json({ verified: true, payload });
    } catch {
        return res.status(401).json({ verified: false });
    }
}
