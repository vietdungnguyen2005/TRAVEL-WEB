import { AuthError } from '../auth.errors';
import type { JwtService } from '../ports/jwt.service';
import type { RefreshTokenRepository } from '../ports/refresh-token.repository';
import type { UserRepository } from '../ports/user.repository';

export type RefreshInput = {
    refreshToken: string;
    ip?: string;
    userAgent?: string;
};

export type RefreshOutput = {
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; name?: string | null; role: any; isVerified: boolean };
};

export class RefreshUseCase {
    constructor(
        private readonly deps: {
            refreshTokens: RefreshTokenRepository;
            users: UserRepository;
            jwt: JwtService;
        }
    ) {}

    async execute(input: RefreshInput): Promise<RefreshOutput> {
        const rotated = await this.deps.refreshTokens.rotate({
            refreshToken: input.refreshToken,
            ip: input.ip,
            userAgent: input.userAgent,
        });

        if (!rotated.ok) throw new AuthError('Unauthorized', 'UNAUTHORIZED');

        const user = await this.deps.users.findById(rotated.userId);
        if (!user) throw new AuthError('Unauthorized', 'UNAUTHORIZED');

        const accessToken = this.deps.jwt.signAccessToken({ userId: user.id, role: user.role });

        return {
            accessToken,
            refreshToken: rotated.refresh.token,
            user,
        };
    }
}
