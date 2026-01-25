import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Singleton pattern cho Prisma Client (tránh tạo nhiều connection trong dev mode)
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
};

// Tạo connection pool
if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
}

const pool = globalForPrisma.pool;
const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
