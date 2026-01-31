"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingMiddleware = void 0;
const morgan_1 = __importDefault(require("morgan"));
const loggingMiddleware = (0, morgan_1.default)('combined');
exports.loggingMiddleware = loggingMiddleware;
//# sourceMappingURL=logging.middleware.js.map