import type { EmailService } from '../ports/email.service';
import type { EmailVerificationRepository } from '../ports/email-verification.repository';
import type { UserRepository } from '../ports/user.repository';
export type ResendVerificationInput = {
    email: string;
};
export type ResendVerificationOutput = {
    success: true;
    alreadyVerified?: true;
};
export declare class ResendVerificationUseCase {
    private readonly deps;
    constructor(deps: {
        users: UserRepository;
        emailVerifications: EmailVerificationRepository;
        email: EmailService;
        webAppUrl?: string;
    });
    execute(input: ResendVerificationInput): Promise<ResendVerificationOutput>;
}
//# sourceMappingURL=resend-verification.usecase.d.ts.map