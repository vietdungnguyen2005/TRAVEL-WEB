"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../interfaces/http/controllers/auth.controller");
const verify_controller_1 = require("../interfaces/http/controllers/verify.controller");
const google_controller_1 = require("../modules/oauth/google/google.controller");
const forgot_password_1 = require("./routes/forgot-password");
const reset_password_express_1 = require("./routes/reset-password-express");
const verify_reset_token_express_1 = require("./routes/verify-reset-token-express");
const email_verification_controller_1 = require("../interfaces/http/controllers/email-verification.controller");
const logout_1 = require("./routes/logout");
const auth_1 = require("./middlewares/auth");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/register', auth_controller_1.register);
exports.authRouter.post('/login', auth_controller_1.login);
exports.authRouter.post('/verify', verify_controller_1.verifyToken);
exports.authRouter.post('/refresh', auth_controller_1.refresh);
// Password reset (Express handlers)
exports.authRouter.post('/forgot-password', forgot_password_1.forgotPassword);
exports.authRouter.post('/reset-password', reset_password_express_1.resetPasswordHandler);
exports.authRouter.get('/verify-reset-token', verify_reset_token_express_1.verifyResetTokenHandler);
// Email verification
exports.authRouter.get('/verify-email', email_verification_controller_1.verifyEmail);
exports.authRouter.post('/verify-email', email_verification_controller_1.verifyEmail);
exports.authRouter.post('/resend-verification', email_verification_controller_1.resendVerificationEmail);
// Logout
exports.authRouter.post('/logout', logout_1.logout);
exports.authRouter.post('/logout-all', auth_1.requireAuth, auth_controller_1.logoutAll);
// OAuth (Google)
exports.authRouter.get('/oauth/google', google_controller_1.googleStart);
exports.authRouter.get('/oauth/google/callback', google_controller_1.googleCallback);
// Example of protected route (admin only)
exports.authRouter.get('/admin-only', auth_1.requireAuth, (0, auth_1.requireRole)('ADMIN'), (_req, res) => res.json({ ok: true }));
//# sourceMappingURL=routes.js.map