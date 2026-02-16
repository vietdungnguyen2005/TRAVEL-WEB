import type { PasswordHasher } from '../../application/auth/ports/password-hasher';
export declare class BcryptPasswordHasher implements PasswordHasher {
    private readonly saltRounds;
    constructor(saltRounds: number);
    hash(password: string): Promise<string>;
    compare(password: string, passwordHash: string): Promise<boolean>;
}
//# sourceMappingURL=bcrypt.password-hasher.d.ts.map