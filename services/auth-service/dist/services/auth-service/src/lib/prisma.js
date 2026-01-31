"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Singleton pattern cho Prisma Client (tránh tạo nhiều connection trong dev mode)
const globalForPrisma = globalThis;
// Prefer per-service DB url, fallback to shared DATABASE_URL
if (!process.env.AUTH_DATABASE_URL && !process.env.DATABASE_URL) {
    throw new Error('Missing AUTH_DATABASE_URL/DATABASE_URL for auth-service');
}
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
//# sourceMappingURL=prisma.js.map