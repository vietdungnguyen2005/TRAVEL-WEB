import type { JwtService } from '../../application/auth/ports/jwt.service';
import type { Role } from '../../domain/auth/auth.types';
import { signAccessToken } from '../../lib/jwt.rs256';

export class Rs256JwtService implements JwtService {
    signAccessToken(input: { userId: string; role: Role; name?: string; email?: string }): string {
        return signAccessToken({ userId: input.userId, role: input.role, name: input.name, email: input.email });
    }
}
