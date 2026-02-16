"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashRefreshToken = hashRefreshToken;
exports.getRefreshTokenTtlMs = getRefreshTokenTtlMs;
exports.generateOpaqueRefreshToken = generateOpaqueRefreshToken;
exports.issueRefreshToken = issueRefreshToken;
exports.revokeRefreshTokenByHash = revokeRefreshTokenByHash;
exports.revokeRefreshTokenFamily = revokeRefreshTokenFamily;
exports.revokeAllUserRefreshTokens = revokeAllUserRefreshTokens;
exports.rotateRefreshToken = rotateRefreshToken;
const crypto_1 = require("crypto");
const prisma_1 = require("./prisma");
function base64UrlFromBytes(bytes) {
    return bytes
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}
function hashRefreshToken(token) {
    return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
}
function getRefreshTokenTtlMs() {
    // Requirement: 7 days
    const days = Number(process.env.REFRESH_TOKEN_DAYS || 7);
    return days * 24 * 60 * 60 * 1000;
}
function generateOpaqueRefreshToken() {
    // 48 bytes => 64 chars base64url-ish
    return base64UrlFromBytes((0, crypto_1.randomBytes)(48));
}
async function issueRefreshToken(params) {
    const client = params.client ?? prisma_1.prisma;
    const token = generateOpaqueRefreshToken();
    const tokenHash = hashRefreshToken(token);
    const familyId = params.familyId ?? (0, crypto_1.randomUUID)();
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
    const pair = {
        token,
        familyId: row.familyId,
        expiresAt: row.expiresAt,
        tokenId: row.id,
    };
    return pair;
}
async function revokeRefreshTokenByHash(tokenHash) {
    await prisma_1.prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
    });
}
async function revokeRefreshTokenFamily(familyId) {
    await prisma_1.prisma.refreshToken.updateMany({
        where: { familyId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
}
async function revokeAllUserRefreshTokens(userId) {
    await prisma_1.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
}
async function rotateRefreshToken(params) {
    const tokenHash = hashRefreshToken(params.refreshToken);
    const existing = await prisma_1.prisma.refreshToken.findUnique({
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
        return { ok: false, reason: 'NOT_FOUND' };
    }
    // Expired
    if (existing.expiresAt.getTime() <= Date.now()) {
        await revokeRefreshTokenByHash(tokenHash);
        return { ok: false, reason: 'EXPIRED' };
    }
    // Reuse detection: token already revoked but points to a replacement
    if (existing.revokedAt && existing.replacedByTokenId) {
        await revokeRefreshTokenFamily(existing.familyId);
        return { ok: false, reason: 'REUSE_DETECTED' };
    }
    // Plain revoked
    if (existing.revokedAt) {
        return { ok: false, reason: 'REVOKED' };
    }
    const next = await prisma_1.prisma.$transaction(async (tx) => {
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
    return { ok: true, userId: existing.userId, familyId: existing.familyId, refresh: next };
}
//# sourceMappingURL=refresh-tokens.js.map