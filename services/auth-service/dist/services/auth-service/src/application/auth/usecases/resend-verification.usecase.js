"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendVerificationUseCase = void 0;
const crypto_1 = require("crypto");
class ResendVerificationUseCase {
    constructor(deps) {
        this.deps = deps;
    }
    async execute(input) {
        const email = input.email.toLowerCase().trim();
        const user = await this.deps.users.findByEmail(email);
        // Don't reveal whether email exists
        if (!user)
            return { success: true };
        if (user.isVerified)
            return { success: true, alreadyVerified: true };
        const rawToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const tokenHash = (0, crypto_1.createHash)('sha256').update(rawToken).digest('hex');
        const ttlMinutes = Number(process.env.EMAIL_VERIFICATION_TTL_MINUTES || 30);
        const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
        await this.deps.emailVerifications.upsertForUser({ userId: user.id, tokenHash, expiresAt });
        const web = this.deps.webAppUrl;
        if (web) {
            const verifyUrl = `${web}/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
            await this.deps.email.sendVerificationEmail({ to: email, name: user.name ?? undefined, verifyUrl });
        }
        return { success: true };
    }
}
exports.ResendVerificationUseCase = ResendVerificationUseCase;
//# sourceMappingURL=resend-verification.usecase.js.map