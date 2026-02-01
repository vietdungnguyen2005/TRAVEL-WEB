"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const auth_client_1 = require("../../node_modules/.prisma/auth-client");
// Singleton pattern cho Prisma Client (tránh tạo nhiều connection trong dev mode)
const globalForPrisma = globalThis;
// Prefer per-service DB url, fallback to shared DATABASE_URL
if (!process.env.AUTH_DATABASE_URL && !process.env.DATABASE_URL) {
    throw new Error('Missing AUTH_DATABASE_URL/DATABASE_URL for auth-service');
}
// Helpful for local dev: let PrismaClient read DATABASE_URL even if schema expects DATABASE_URL.
// (Auth-service schema now uses DATABASE_URL; this keeps backward compatibility if AUTH_DATABASE_URL is used.)
const databaseUrl = process.env.AUTH_DATABASE_URL ?? process.env.DATABASE_URL;
exports.prisma = globalForPrisma.prisma ??
    new auth_client_1.PrismaClient({
        datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
//# sourceMappingURL=prisma.js.map