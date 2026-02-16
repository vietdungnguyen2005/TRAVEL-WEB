export interface PasswordHasher {
    hash(password: string): Promise<string>;
    compare(password: string, passwordHash: string): Promise<boolean>;
}
//# sourceMappingURL=password-hasher.d.ts.map