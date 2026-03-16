"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
const auth_errors_1 = require("../auth.errors");
class LoginUseCase {
    constructor(deps) {
        this.deps = deps;
    }
    async execute(input) {
        const email = input.email.toLowerCase().trim();
        const user = await this.deps.users.findByEmail(email);
        if (!user)
            throw new auth_errors_1.AuthError('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS');
        if (input.requireEmailVerification && !user.isVerified) {
            throw new auth_errors_1.AuthError('Tài khoản chưa xác nhận email', 'EMAIL_NOT_VERIFIED');
        }
        const ok = await this.deps.passwordHasher.compare(input.password, user.passwordHash);
        if (!ok)
            throw new auth_errors_1.AuthError('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS');
        const accessToken = this.deps.jwt.signAccessToken({ userId: user.id, role: user.role, name: user.name ?? undefined, email: user.email });
        const refresh = await this.deps.refreshTokens.issue({
            userId: user.id,
            ip: input.ip,
            userAgent: input.userAgent,
        });
        const { passwordHash: _pw, ...safeUser } = user;
        void _pw;
        return { user: safeUser, accessToken, refreshToken: refresh.token };
    }
}
exports.LoginUseCase = LoginUseCase;
//# sourceMappingURL=login.usecase.js.map