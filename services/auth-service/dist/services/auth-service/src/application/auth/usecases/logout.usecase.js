"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutUseCase = void 0;
class LogoutUseCase {
    constructor(deps) {
        this.deps = deps;
    }
    async execute(input) {
        if (!input.refreshToken)
            return;
        await this.deps.refreshTokens.revokeByRawToken(input.refreshToken);
    }
}
exports.LogoutUseCase = LogoutUseCase;
//# sourceMappingURL=logout.usecase.js.map