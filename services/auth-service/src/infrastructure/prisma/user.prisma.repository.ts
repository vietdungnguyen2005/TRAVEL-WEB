import type { UserRepository } from '../../application/auth/ports/user.repository';
import type { AuthUser } from '../../domain/auth/auth.types';
import { prisma } from '../../lib/prisma';

export class PrismaUserRepository implements UserRepository {
    async findByEmail(email: string): Promise<(AuthUser & { passwordHash: string }) | null> {
        const row = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true, role: true, isVerified: true, password: true },
        });

        if (!row) return null;

        return {
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role,
            isVerified: row.isVerified,
            passwordHash: row.password,
        };
    }

    async findById(id: string): Promise<AuthUser | null> {
        const row = await prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, name: true, role: true, isVerified: true },
        });

        if (!row) return null;

        return {
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role,
            isVerified: row.isVerified,
        };
    }

    async create(input: {
        email: string;
        passwordHash: string;
        name?: string | null;
        role: AuthUser['role'];
        isVerified: boolean;
        verificationToken?: string | null;
    }): Promise<AuthUser> {
        const row = await prisma.user.create({
            data: {
                email: input.email,
                password: input.passwordHash,
                name: input.name ?? null,
                role: input.role,
                isVerified: input.isVerified,
                verificationToken: input.verificationToken ?? null,
            },
            select: { id: true, email: true, name: true, role: true, isVerified: true },
        });

        return {
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role,
            isVerified: row.isVerified,
        };
    }

    async markVerified(userId: string): Promise<void> {
        await prisma.user.update({ where: { id: userId }, data: { isVerified: true } });
    }
}
