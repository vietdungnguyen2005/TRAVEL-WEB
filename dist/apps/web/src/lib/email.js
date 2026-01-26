import { Resend } from 'resend';
if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.');
}
export const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key');
export const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
//# sourceMappingURL=email.js.map