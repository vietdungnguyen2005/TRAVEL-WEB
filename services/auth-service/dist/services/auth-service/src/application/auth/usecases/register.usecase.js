"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUseCase = void 0;
const crypto_1 = require("crypto");
const auth_errors_1 = require("../auth.errors");
class RegisterUseCase {
    constructor(deps) {
        this.deps = deps;
    }
    async execute(input) {
        const email = input.email.toLowerCase().trim();
        const existing = await this.deps.users.findByEmail(email);
        if (existing)
            throw new auth_errors_1.AuthError('Email đã được sử dụng', 'EMAIL_IN_USE');
        const passwordHash = await this.deps.passwordHasher.hash(input.password);
        const mustVerify = input.requireEmailVerification;
        const user = await this.deps.users.create({
            email,
            passwordHash,
            name: input.name,
            role: input.role ?? 'CUSTOMER',
            isVerified: mustVerify ? false : true,
            verificationToken: null,
        });
        if (mustVerify) {
            const rawToken = (0, crypto_1.randomBytes)(32).toString('hex');
            const tokenHash = (0, crypto_1.createHash)('sha256').update(rawToken).digest('hex');
            const ttlMinutes = Number(process.env.EMAIL_VERIFICATION_TTL_MINUTES || 30);
            const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
            await this.deps.emailVerifications.upsertForUser({ userId: user.id, tokenHash, expiresAt });
            const web = this.deps.webAppUrl;
            if (web) {
                const verifyUrl = `${web}/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
                try {
                    await this.deps.email.sendVerificationEmail({ to: email, name: user.name ?? undefined, verifyUrl });
                }
                catch (emailErr) {
                    // Log but don't fail registration — user is already created
                    console.error('[RegisterUseCase] Failed to send verification email:', emailErr instanceof Error ? emailErr.message : emailErr);
                }
            }
            else {
                console.warn('[RegisterUseCase] WEB_APP_URL not configured, skipping verification email');
            }
            return { status: 'NEEDS_EMAIL_VERIFICATION', user };
        }
        const accessToken = this.deps.jwt.signAccessToken({ userId: user.id, role: user.role, name: user.name ?? undefined, email: user.email });
        const refresh = await this.deps.refreshTokens.issue({
            userId: user.id,
            ip: input.ip,
            userAgent: input.userAgent,
        });
        return { status: 'OK', user, accessToken, refreshToken: refresh.token };
    }
}
exports.RegisterUseCase = RegisterUseCase;
//# sourceMappingURL=register.usecase.js.map