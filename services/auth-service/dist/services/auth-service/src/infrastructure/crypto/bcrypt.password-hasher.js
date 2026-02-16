"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptPasswordHasher = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class BcryptPasswordHasher {
    constructor(saltRounds) {
        this.saltRounds = saltRounds;
    }
    hash(password) {
        return bcrypt_1.default.hash(password, this.saltRounds);
    }
    compare(password, passwordHash) {
        return bcrypt_1.default.compare(password, passwordHash);
    }
}
exports.BcryptPasswordHasher = BcryptPasswordHasher;
//# sourceMappingURL=bcrypt.password-hasher.js.map