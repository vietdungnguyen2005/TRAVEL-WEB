export type SendVerificationEmailInput = {
    to: string;
    verifyUrl: string;
    name?: string;
};

export interface EmailService {
    sendVerificationEmail(input: SendVerificationEmailInput): Promise<void>;
}
