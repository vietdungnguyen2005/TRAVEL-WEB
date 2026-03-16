"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rs256JwtService = void 0;
const jwt_rs256_1 = require("../../lib/jwt.rs256");
class Rs256JwtService {
    signAccessToken(input) {
        return (0, jwt_rs256_1.signAccessToken)({ userId: input.userId, role: input.role, name: input.name, email: input.email });
    }
}
exports.Rs256JwtService = Rs256JwtService;
//# sourceMappingURL=rs256.jwt.service.js.map