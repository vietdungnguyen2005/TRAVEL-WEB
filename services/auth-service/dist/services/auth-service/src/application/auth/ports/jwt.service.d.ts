import type { Role } from '../../../domain/auth/auth.types';
export type AccessToken = string;
export interface JwtService {
    signAccessToken(input: {
        userId: string;
        role: Role;
        name?: string;
        email?: string;
    }): AccessToken;
}
//# sourceMappingURL=jwt.service.d.ts.map