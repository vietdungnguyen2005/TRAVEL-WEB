"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../modules/auth/auth.controller");
const google_controller_1 = require("../modules/oauth/google/google.controller");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/register', auth_controller_1.register);
exports.authRouter.post('/login', auth_controller_1.login);
exports.authRouter.post('/verify', auth_controller_1.verifyToken);
// OAuth (Google)
exports.authRouter.get('/oauth/google', google_controller_1.googleStart);
exports.authRouter.get('/oauth/google/callback', google_controller_1.googleCallback);
//# sourceMappingURL=routes.js.map