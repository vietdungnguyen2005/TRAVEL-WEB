"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = verifyEmail;
exports.resendVerificationEmail = resendVerificationEmail;
const zod_1 = require("zod");
const auth_errors_1 = require("../../../application/auth/auth.errors");
const verify_email_usecase_1 = require("../../../application/auth/usecases/verify-email.usecase");
const resend_verification_usecase_1 = require("../../../application/auth/usecases/resend-verification.usecase");
const user_prisma_repository_1 = require("../../../infrastructure/prisma/user.prisma.repository");
const email_verification_prisma_repository_1 = require("../../../infrastructure/prisma/email-verification.prisma.repository");
const nodemailer_email_service_1 = require("../../../infrastructure/email/nodemailer.email.service");
function mapAuthError(err, res) {
    if (err instanceof auth_errors_1.AuthError) {
        if (err.code === 'INVALID_VERIFICATION_TOKEN')
            return res.status(400).json({ error: 'invalid token' });
        if (err.code === 'EXPIRED_VERIFICATION_TOKEN')
            return res.status(400).json({ error: 'expired token' });
        return res.status(400).json({ error: 'bad request' });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
}
const deps = {
    users: new user_prisma_repository_1.PrismaUserRepository(),
    emailVerifications: new email_verification_prisma_repository_1.PrismaEmailVerificationRepository(),
    email: new nodemailer_email_service_1.NodemailerEmailService(),
    webAppUrl: (process.env.WEB_APP_URL || '').replace(/\/+$/, '') || undefined,
};
async function verifyEmail(req, res) {
    const rawToken = typeof req.query?.token === 'string' ? req.query.token : req.body?.token;
    const parsed = zod_1.z.object({ token: zod_1.z.string().min(10) }).safeParse({ token: rawToken });
    if (!parsed.success)
        return res.status(400).json({ error: 'token required' });
    try {
        const uc = new verify_email_usecase_1.VerifyEmailUseCase({ users: deps.users, emailVerifications: deps.emailVerifications });
        await uc.execute({ token: parsed.data.token });
        return res.status(200).json({ success: true });
    }
    catch (err) {
        return mapAuthError(err, res);
    }
}
async function resendVerificationEmail(req, res) {
    const parsed = zod_1.z.object({ email: zod_1.z.string().email() }).safeParse(req.body ?? {});
    if (!parsed.success)
        return res.status(400).json({ error: 'email required' });
    try {
        const uc = new resend_verification_usecase_1.ResendVerificationUseCase({
            users: deps.users,
            emailVerifications: deps.emailVerifications,
            email: deps.email,
            webAppUrl: deps.webAppUrl,
        });
        const result = await uc.execute({ email: parsed.data.email });
        return res.status(200).json(result);
    }
    catch (err) {
        return mapAuthError(err, res);
    }
}
//# sourceMappingURL=email-verification.controller.js.map