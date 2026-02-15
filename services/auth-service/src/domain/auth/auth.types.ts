export type Role = 'ADMIN' | 'CUSTOMER';

export type AuthUser = {
    id: string;
    email: string;
    name?: string | null;
    role: Role;
    isVerified: boolean;
};
