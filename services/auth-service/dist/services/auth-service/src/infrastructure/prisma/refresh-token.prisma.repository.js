"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaRefreshTokenRepository = void 0;
const refresh_tokens_1 = require("../../lib/refresh-tokens");
class PrismaRefreshTokenRepository {
    async issue(input) {
        return (0, refresh_tokens_1.issueRefreshToken)(input);
    }
    async rotate(input) {
        return (0, refresh_tokens_1.rotateRefreshToken)(input);
    }
    async revokeByRawToken(rawRefreshToken) {
        await (0, refresh_tokens_1.revokeRefreshTokenByHash)((0, refresh_tokens_1.hashRefreshToken)(rawRefreshToken));
    }
    async revokeAllByUserId(userId) {
        await (0, refresh_tokens_1.revokeAllUserRefreshTokens)(userId);
    }
}
exports.PrismaRefreshTokenRepository = PrismaRefreshTokenRepository;
//# sourceMappingURL=refresh-token.prisma.repository.js.map