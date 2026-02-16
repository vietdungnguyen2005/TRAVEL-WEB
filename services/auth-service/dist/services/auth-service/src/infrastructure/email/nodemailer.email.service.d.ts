import type { EmailService } from '../../application/auth/ports/email.service';
export declare class NodemailerEmailService implements EmailService {
    sendVerificationEmail(input: {
        to: string;
        verifyUrl: string;
        name?: string;
    }): Promise<void>;
}
//# sourceMappingURL=nodemailer.email.service.d.ts.map