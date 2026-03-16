import path from 'path';

import { createRequire } from 'module';
import type { PrismaClient as GeneratedPrismaClient } from '../../node_modules/.prisma/auth-client';

const generatedClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'auth-client');
const requireFromHere = createRequire(__filename);
const { PrismaClient } = requireFromHere(generatedClientPath) as unknown as {
    PrismaClient: new (options?: unknown) => GeneratedPrismaClient;
};

// Singleton pattern cho Prisma Client (tránh tạo nhiều connection trong dev mode)
const globalForPrisma = globalThis as unknown as {
	prisma: GeneratedPrismaClient | undefined;
};

// Prefer per-service DB url, fallback to shared DATABASE_URL
if (!process.env.AUTH_DATABASE_URL && !process.env.DATABASE_URL) {
    throw new Error('Missing AUTH_DATABASE_URL/DATABASE_URL for auth-service');
}

// Helpful for local dev: let PrismaClient read DATABASE_URL even if schema expects DATABASE_URL.
// (Auth-service schema now uses DATABASE_URL; this keeps backward compatibility if AUTH_DATABASE_URL is used.)
const databaseUrl = process.env.AUTH_DATABASE_URL ?? process.env.DATABASE_URL;

// Append connection_limit if not already set to avoid pool exhaustion on shared Supabase
const finalUrl = (() => {
	if (!databaseUrl) return undefined;
	if (/connection_limit=/i.test(databaseUrl)) return databaseUrl;
	const sep = databaseUrl.includes('?') ? '&' : '?';
	return `${databaseUrl}${sep}connection_limit=2`;
})();

export const prisma: GeneratedPrismaClient =
	globalForPrisma.prisma ??
	new PrismaClient({
		datasources: finalUrl ? { db: { url: finalUrl } } : undefined,
		log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
	});

// Ensure stable typing when importing PrismaClient from a generated output path
export type AuthPrismaClient = GeneratedPrismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
