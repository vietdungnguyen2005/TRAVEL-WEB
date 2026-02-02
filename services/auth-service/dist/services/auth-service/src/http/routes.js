"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../modules/auth/auth.controller");
const google_controller_1 = require("../modules/oauth/google/google.controller");
const forgot_password_1 = require("./routes/forgot-password");
const reset_password_express_1 = require("./routes/reset-password-express");
const verify_reset_token_express_1 = require("./routes/verify-reset-token-express");
const verify_email_express_1 = require("./routes/verify-email-express");
const resend_verification_1 = require("./routes/resend-verification");
const logout_1 = require("./routes/logout");
const auth_1 = require("./middlewares/auth");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/register', auth_controller_1.register);
exports.authRouter.post('/login', auth_controller_1.login);
exports.authRouter.post('/verify', auth_controller_1.verifyToken);
// Password reset (Express handlers)
exports.authRouter.post('/forgot-password', forgot_password_1.forgotPassword);
exports.authRouter.post('/reset-password', reset_password_express_1.resetPasswordHandler);
exports.authRouter.get('/verify-reset-token', verify_reset_token_express_1.verifyResetTokenHandler);
// Email verification
exports.authRouter.post('/verify-email', verify_email_express_1.verifyEmailHandler);
exports.authRouter.post('/resend-verification', resend_verification_1.resendVerificationEmailHandler);
// Logout
exports.authRouter.post('/logout', logout_1.logout);
// OAuth (Google)
exports.authRouter.get('/oauth/google', google_controller_1.googleStart);
exports.authRouter.get('/oauth/google/callback', google_controller_1.googleCallback);
// Example of protected route (admin only)
exports.authRouter.get('/admin-only', auth_1.requireAuth, (0, auth_1.requireRole)('ADMIN'), (_req, res) => res.json({ ok: true }));
//# sourceMappingURL=routes.js.map