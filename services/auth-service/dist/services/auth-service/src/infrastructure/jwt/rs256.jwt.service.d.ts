import type { JwtService } from '../../application/auth/ports/jwt.service';
import type { Role } from '../../domain/auth/auth.types';
export declare class Rs256JwtService implements JwtService {
    signAccessToken(input: {
        userId: string;
        role: Role;
    }): string;
}
//# sourceMappingURL=rs256.jwt.service.d.ts.map