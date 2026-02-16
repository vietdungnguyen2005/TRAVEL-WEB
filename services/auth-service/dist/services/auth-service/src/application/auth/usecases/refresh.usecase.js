"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshUseCase = void 0;
const auth_errors_1 = require("../auth.errors");
class RefreshUseCase {
    constructor(deps) {
        this.deps = deps;
    }
    async execute(input) {
        const rotated = await this.deps.refreshTokens.rotate({
            refreshToken: input.refreshToken,
            ip: input.ip,
            userAgent: input.userAgent,
        });
        if (!rotated.ok)
            throw new auth_errors_1.AuthError('Unauthorized', 'UNAUTHORIZED');
        const user = await this.deps.users.findById(rotated.userId);
        if (!user)
            throw new auth_errors_1.AuthError('Unauthorized', 'UNAUTHORIZED');
        const accessToken = this.deps.jwt.signAccessToken({ userId: user.id, role: user.role });
        return {
            accessToken,
            refreshToken: rotated.refresh.token,
            user,
        };
    }
}
exports.RefreshUseCase = RefreshUseCase;
//# sourceMappingURL=refresh.usecase.js.map