import bcrypt from 'bcrypt';
import type { PasswordHasher } from '../../application/auth/ports/password-hasher';

export class BcryptPasswordHasher implements PasswordHasher {
    constructor(private readonly saltRounds: number) {}

    hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    compare(password: string, passwordHash: string): Promise<boolean> {
        return bcrypt.compare(password, passwordHash);
    }
}
