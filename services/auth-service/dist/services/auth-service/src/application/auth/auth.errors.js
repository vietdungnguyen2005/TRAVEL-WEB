"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = void 0;
class AuthError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
exports.AuthError = AuthError;
//# sourceMappingURL=auth.errors.js.map