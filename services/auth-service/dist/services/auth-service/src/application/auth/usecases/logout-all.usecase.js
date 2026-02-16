"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutAllUseCase = void 0;
class LogoutAllUseCase {
    constructor(deps) {
        this.deps = deps;
    }
    async execute(input) {
        await this.deps.refreshTokens.revokeAllByUserId(input.userId);
    }
}
exports.LogoutAllUseCase = LogoutAllUseCase;
//# sourceMappingURL=logout-all.usecase.js.map