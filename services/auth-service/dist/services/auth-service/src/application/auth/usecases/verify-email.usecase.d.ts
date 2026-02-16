import type { EmailVerificationRepository } from '../ports/email-verification.repository';
import type { UserRepository } from '../ports/user.repository';
export type VerifyEmailInput = {
    token: string;
};
export type VerifyEmailOutput = {
    success: true;
};
export declare class VerifyEmailUseCase {
    private readonly deps;
    constructor(deps: {
        emailVerifications: EmailVerificationRepository;
        users: UserRepository;
    });
    execute(input: VerifyEmailInput): Promise<VerifyEmailOutput>;
}
//# sourceMappingURL=verify-email.usecase.d.ts.map