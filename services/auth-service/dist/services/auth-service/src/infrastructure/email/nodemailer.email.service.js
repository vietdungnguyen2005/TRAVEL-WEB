"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodemailerEmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
function buildVerifyEmailHtml(input) {
    const safeName = input.name ? String(input.name) : 'bạn';
    return `
<div style="font-family:Arial,sans-serif;line-height:1.5">
  <h2>Xác nhận email</h2>
  <p>Chào ${safeName},</p>
  <p>Vui lòng bấm vào nút bên dưới để xác nhận email của bạn:</p>
  <p style="margin:24px 0">
    <a href="${input.verifyUrl}" style="background:#0f172a;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;display:inline-block">Xác nhận email</a>
  </p>
  <p>Nếu nút không hoạt động, mở link này:</p>
  <p><a href="${input.verifyUrl}">${input.verifyUrl}</a></p>
  <p style="color:#64748b;font-size:12px">Nếu bạn không tạo tài khoản, vui lòng bỏ qua email này.</p>
</div>`;
}
function createTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !port || !user || !pass)
        return null;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    return nodemailer_1.default.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
}
class NodemailerEmailService {
    async sendVerificationEmail(input) {
        const from = process.env.SMTP_FROM || process.env.SMTP_USER;
        if (!from)
            throw new Error('SMTP_FROM/SMTP_USER is not set');
        const transporter = createTransporter();
        if (!transporter) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('SMTP is not configured');
            }
            // Dev fallback: log the link so the flow can be tested locally.
            // eslint-disable-next-line no-console
            console.info('[auth-service] Verification email link:', input.verifyUrl);
            return;
        }
        await transporter.sendMail({
            from,
            to: input.to,
            subject: 'Xác nhận email của bạn',
            html: buildVerifyEmailHtml({ verifyUrl: input.verifyUrl, to: input.to, name: input.name }),
        });
    }
}
exports.NodemailerEmailService = NodemailerEmailService;
//# sourceMappingURL=nodemailer.email.service.js.map