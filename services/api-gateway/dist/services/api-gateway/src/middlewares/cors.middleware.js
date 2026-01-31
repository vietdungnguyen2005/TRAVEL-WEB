"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
const cors_1 = __importDefault(require("cors"));
// Dev CORS whitelist.
// - localhost:3000 is default Next dev
// - include common loopback + LAN origin so you can test from another device on the same Wi-Fi
//   (matches the Next.js `allowedDevOrigins` in apps/web/next.config.ts)
const whitelist = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.1.43:3000',
];
exports.corsMiddleware = (0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
});
//# sourceMappingURL=cors.middleware.js.map