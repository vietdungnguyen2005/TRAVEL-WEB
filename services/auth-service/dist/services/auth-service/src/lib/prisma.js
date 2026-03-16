"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const path_1 = __importDefault(require("path"));
const module_1 = require("module");
const generatedClientPath = path_1.default.join(process.cwd(), 'node_modules', '.prisma', 'auth-client');
const requireFromHere = (0, module_1.createRequire)(__filename);
const { PrismaClient } = requireFromHere(generatedClientPath);
// Singleton pattern cho Prisma Client (tránh tạo nhiều connection trong dev mode)
const globalForPrisma = globalThis;
// Prefer per-service DB url, fallback to shared DATABASE_URL
if (!process.env.AUTH_DATABASE_URL && !process.env.DATABASE_URL) {
    throw new Error('Missing AUTH_DATABASE_URL/DATABASE_URL for auth-service');
}
// Helpful for local dev: let PrismaClient read DATABASE_URL even if schema expects DATABASE_URL.
// (Auth-service schema now uses DATABASE_URL; this keeps backward compatibility if AUTH_DATABASE_URL is used.)
const databaseUrl = process.env.AUTH_DATABASE_URL ?? process.env.DATABASE_URL;
// Append connection_limit if not already set to avoid pool exhaustion on shared Supabase
const finalUrl = (() => {
    if (!databaseUrl)
        return undefined;
    if (/connection_limit=/i.test(databaseUrl))
        return databaseUrl;
    const sep = databaseUrl.includes('?') ? '&' : '?';
    return `${databaseUrl}${sep}connection_limit=5`;
})();
exports.prisma = globalForPrisma.prisma ??
    new PrismaClient({
        datasources: finalUrl ? { db: { url: finalUrl } } : undefined,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
//# sourceMappingURL=prisma.js.map