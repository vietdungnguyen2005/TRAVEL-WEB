import type { AuthUser, Role } from '../../../domain/auth/auth.types';

export type CreateUserInput = {
    email: string;
    passwordHash: string;
    name?: string | null;
    phone?: string | null;
    role: Role;
    isVerified: boolean;
    verificationToken?: string | null;
};

export interface UserRepository {
    findByEmail(email: string): Promise<(AuthUser & { passwordHash: string }) | null>;
    findById(id: string): Promise<AuthUser | null>;
    create(input: CreateUserInput): Promise<AuthUser>;
    markVerified(userId: string): Promise<void>;
}
