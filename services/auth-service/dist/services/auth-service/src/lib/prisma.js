"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
// Singleton pattern cho Prisma Client (tránh tạo nhiều connection trong dev mode)
const globalForPrisma = globalThis;
// Tạo connection pool
if (!globalForPrisma.pool) {
    globalForPrisma.pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
    });
}
const pool = globalForPrisma.pool;
const adapter = new adapter_pg_1.PrismaPg(pool);
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
//# sourceMappingURL=prisma.js.map