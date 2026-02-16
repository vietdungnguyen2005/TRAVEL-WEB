"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyEmailUseCase = void 0;
const crypto_1 = require("crypto");
const auth_errors_1 = require("../auth.errors");
class VerifyEmailUseCase {
    constructor(deps) {
        this.deps = deps;
    }
    async execute(input) {
        const token = input.token?.toString().trim();
        if (!token)
            throw new auth_errors_1.AuthError('Token không hợp lệ', 'INVALID_VERIFICATION_TOKEN');
        const tokenHash = (0, crypto_1.createHash)('sha256').update(token).digest('hex');
        const record = await this.deps.emailVerifications.findByTokenHash(tokenHash);
        if (!record)
            throw new auth_errors_1.AuthError('Token không hợp lệ', 'INVALID_VERIFICATION_TOKEN');
        if (record.expiresAt.getTime() < Date.now()) {
            await this.deps.emailVerifications.deleteById(record.id).catch(() => undefined);
            throw new auth_errors_1.AuthError('Token đã hết hạn', 'EXPIRED_VERIFICATION_TOKEN');
        }
        await this.deps.users.markVerified(record.userId);
        await this.deps.emailVerifications.deleteById(record.id);
        return { success: true };
    }
}
exports.VerifyEmailUseCase = VerifyEmailUseCase;
//# sourceMappingURL=verify-email.usecase.js.map