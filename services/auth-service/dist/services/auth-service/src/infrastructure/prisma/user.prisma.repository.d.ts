import type { UserRepository } from '../../application/auth/ports/user.repository';
import type { AuthUser } from '../../domain/auth/auth.types';
export declare class PrismaUserRepository implements UserRepository {
    findByEmail(email: string): Promise<(AuthUser & {
        passwordHash: string;
    }) | null>;
    findById(id: string): Promise<AuthUser | null>;
    create(input: {
        email: string;
        passwordHash: string;
        name?: string | null;
        role: AuthUser['role'];
        isVerified: boolean;
        verificationToken?: string | null;
    }): Promise<AuthUser>;
    markVerified(userId: string): Promise<void>;
}
//# sourceMappingURL=user.prisma.repository.d.ts.map