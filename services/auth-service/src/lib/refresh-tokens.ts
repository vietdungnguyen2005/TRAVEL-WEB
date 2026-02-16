import { createHash, randomBytes, randomUUID } from 'crypto';
import { prisma } from './prisma';
import type { Prisma } from '../../node_modules/.prisma/auth-client';

export type RefreshTokenPair = {
    token: string;
    familyId: string;
    expiresAt: Date;
    tokenId: string;
};

function base64UrlFromBytes(bytes: Buffer) {
    return bytes
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

export function hashRefreshToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenTtlMs() {
    // Requirement: 7 days
    const days = Number(process.env.REFRESH_TOKEN_DAYS || 7);
    return days * 24 * 60 * 60 * 1000;
}

export function generateOpaqueRefreshToken() {
    // 48 bytes => 64 chars base64url-ish
    return base64UrlFromBytes(randomBytes(48));
}

export async function issueRefreshToken(params: {
    userId: string;
    ip?: string;
    userAgent?: string;
    familyId?: string;
    client?: Prisma.TransactionClient | typeof prisma;
}) {
    const client = params.client ?? prisma;
    const token = generateOpaqueRefreshToken();
    const tokenHash = hashRefreshToken(token);
    const familyId = params.familyId ?? randomUUID();
    const expiresAt = new Date(Date.now() + getRefreshTokenTtlMs());

    const row = await client.refreshToken.create({
        data: {
            userId: params.userId,
            tokenHash,
            familyId,
            expiresAt,
            ip: params.ip,
            userAgent: params.userAgent,
        },
        select: { id: true, familyId: true, expiresAt: true },
    });

    const pair: RefreshTokenPair = {
        token,
        familyId: row.familyId,
        expiresAt: row.expiresAt,
        tokenId: row.id,
    };

    return pair;
}

export async function revokeRefreshTokenByHash(tokenHash: string) {
    await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
    });
}

export async function revokeRefreshTokenFamily(familyId: string) {
    await prisma.refreshToken.updateMany({
        where: { familyId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
}

export async function revokeAllUserRefreshTokens(userId: string) {
    await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
}

export async function rotateRefreshToken(params: {
    refreshToken: string;
    ip?: string;
    userAgent?: string;
}) {
    const tokenHash = hashRefreshToken(params.refreshToken);

    const existing = await prisma.refreshToken.findUnique({
        where: { tokenHash },
        select: {
            id: true,
            userId: true,
            familyId: true,
            expiresAt: true,
            revokedAt: true,
            replacedByTokenId: true,
        },
    });

    if (!existing) {
        return { ok: false as const, reason: 'NOT_FOUND' as const };
    }

    // Expired
    if (existing.expiresAt.getTime() <= Date.now()) {
        await revokeRefreshTokenByHash(tokenHash);
        return { ok: false as const, reason: 'EXPIRED' as const };
    }

    // Reuse detection: token already revoked but points to a replacement
    if (existing.revokedAt && existing.replacedByTokenId) {
        await revokeRefreshTokenFamily(existing.familyId);
        return { ok: false as const, reason: 'REUSE_DETECTED' as const };
    }

    // Plain revoked
    if (existing.revokedAt) {
        return { ok: false as const, reason: 'REVOKED' as const };
    }

    const next = await prisma.$transaction(async (tx) => {
        const rotated = await issueRefreshToken({
            userId: existing.userId,
            familyId: existing.familyId,
            ip: params.ip,
            userAgent: params.userAgent,
            client: tx,
        });

        await tx.refreshToken.update({
            where: { id: existing.id },
            data: {
                revokedAt: new Date(),
                lastUsedAt: new Date(),
                replacedByTokenId: rotated.tokenId,
            },
            select: { id: true },
        });

        return rotated;
    });

    return { ok: true as const, userId: existing.userId, familyId: existing.familyId, refresh: next };
}
