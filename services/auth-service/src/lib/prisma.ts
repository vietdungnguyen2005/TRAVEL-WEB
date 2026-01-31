import { PrismaClient } from '../../node_modules/.prisma/auth-client';

// Singleton pattern cho Prisma Client (tránh tạo nhiều connection trong dev mode)
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Prefer per-service DB url, fallback to shared DATABASE_URL
if (!process.env.AUTH_DATABASE_URL && !process.env.DATABASE_URL) {
    throw new Error('Missing AUTH_DATABASE_URL/DATABASE_URL for auth-service');
}

// Helpful for local dev: let PrismaClient read DATABASE_URL even if schema expects DATABASE_URL.
// (Auth-service schema now uses DATABASE_URL; this keeps backward compatibility if AUTH_DATABASE_URL is used.)
const databaseUrl = process.env.AUTH_DATABASE_URL ?? process.env.DATABASE_URL;

export const prisma: PrismaClient =
    globalForPrisma.prisma ??
    new PrismaClient({
        datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

// Ensure stable typing when importing PrismaClient from a generated output path
export type AuthPrismaClient = PrismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
