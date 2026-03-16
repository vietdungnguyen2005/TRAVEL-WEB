import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { EmailService } from '../../application/auth/ports/email.service';

function emailLayout(content: string) {
    return `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <!-- Header -->
        <tr><td style="background:#0f172a;padding:24px 32px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px">🏨 TravelBook</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0">
          <p style="margin:0;color:#94a3b8;font-size:12px">© 2026 TravelBook. Tất cả quyền được bảo lưu.</p>
          <p style="margin:4px 0 0;color:#94a3b8;font-size:11px">Email này được gửi tự động, vui lòng không trả lời.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildVerifyEmailHtml(input: { verifyUrl: string; to: string; name?: string }) {
    const safeName = input.name ? String(input.name) : 'bạn';
    return emailLayout(`
          <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">Xác nhận email</h2>
          <p style="color:#475569;line-height:1.6;margin:0 0 16px">Chào <strong>${safeName}</strong>,</p>
          <p style="color:#475569;line-height:1.6;margin:0 0 24px">Cảm ơn bạn đã đăng ký tài khoản TravelBook! Vui lòng bấm nút bên dưới để xác nhận email:</p>
          <div style="text-align:center;margin:0 0 24px">
            <a href="${input.verifyUrl}" style="background:#0f172a;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:600;font-size:15px">✓ Xác nhận email</a>
          </div>
          <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0 0 8px">Nếu nút không hoạt động, mở link sau:</p>
          <p style="word-break:break-all;margin:0 0 16px"><a href="${input.verifyUrl}" style="color:#2563eb;font-size:13px">${input.verifyUrl}</a></p>
          <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:4px;margin:16px 0 0">
            <p style="margin:0;color:#92400e;font-size:13px">⏰ Link có hiệu lực trong <strong>30 phút</strong>. Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email.</p>
          </div>
    `);
}

function createTransporter(): Transporter | null {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) return null;

    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
}

export class NodemailerEmailService implements EmailService {
    private getTransporterAndFrom() {
        const from = process.env.SMTP_FROM || process.env.SMTP_USER;
        const transporter = createTransporter();
        return { from, transporter };
    }

    async sendVerificationEmail(input: { to: string; verifyUrl: string; name?: string }): Promise<void> {
        const { from, transporter } = this.getTransporterAndFrom();

        if (!transporter) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('SMTP is not configured');
            }
            console.info('[auth-service] Verification email link:', input.verifyUrl);
            return;
        }

        if (!from) throw new Error('SMTP_FROM/SMTP_USER is not set');

        await transporter.sendMail({
            from,
            to: input.to,
            subject: 'Xác nhận email của bạn — TravelBook',
            html: buildVerifyEmailHtml({ verifyUrl: input.verifyUrl, to: input.to, name: input.name }),
        });
    }

    async sendResetPasswordEmail(input: { to: string; resetUrl: string; name?: string }): Promise<void> {
        const { from, transporter } = this.getTransporterAndFrom();

        if (!transporter) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('SMTP is not configured');
            }
            console.info('[auth-service] Reset password link:', input.resetUrl);
            return;
        }

        if (!from) throw new Error('SMTP_FROM/SMTP_USER is not set');

        const safeName = input.name ? String(input.name) : 'bạn';
        const html = emailLayout(`
          <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">Đặt lại mật khẩu</h2>
          <p style="color:#475569;line-height:1.6;margin:0 0 16px">Chào <strong>${safeName}</strong>,</p>
          <p style="color:#475569;line-height:1.6;margin:0 0 24px">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản TravelBook của bạn. Bấm nút bên dưới để tiếp tục:</p>
          <div style="text-align:center;margin:0 0 24px">
            <a href="${input.resetUrl}" style="background:#dc2626;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:600;font-size:15px">🔑 Đặt lại mật khẩu</a>
          </div>
          <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0 0 8px">Nếu nút không hoạt động, mở link sau:</p>
          <p style="word-break:break-all;margin:0 0 16px"><a href="${input.resetUrl}" style="color:#2563eb;font-size:13px">${input.resetUrl}</a></p>
          <div style="background:#fee2e2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:4px;margin:16px 0 0">
            <p style="margin:0;color:#991b1b;font-size:13px">⏰ Link có hiệu lực trong <strong>1 giờ</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          </div>
        `);

        await transporter.sendMail({
            from,
            to: input.to,
            subject: 'Đặt lại mật khẩu — TravelBook',
            html,
        });
    }
}
