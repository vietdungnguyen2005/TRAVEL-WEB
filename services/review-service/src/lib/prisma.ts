import path from 'path';
import { createRequire } from 'module';
import type { PrismaClient as GeneratedPrismaClient } from '../../node_modules/.prisma/review-client';

const generatedClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'review-client');
const requireFromHere = createRequire(__filename);
const { PrismaClient } = requireFromHere(generatedClientPath) as unknown as {
    PrismaClient: new (opts?: Record<string, unknown>) => GeneratedPrismaClient;
};

function buildDatasourceUrl(): string | undefined {
    const raw = process.env.DATABASE_URL;
    if (!raw) return undefined;
    if (/connection_limit=/i.test(raw)) return raw;
    const sep = raw.includes('?') ? '&' : '?';
    return `${raw}${sep}connection_limit=2`;
}

const dsUrl = buildDatasourceUrl();
const prisma: GeneratedPrismaClient = new PrismaClient(
    dsUrl ? { datasources: { db: { url: dsUrl } } } : undefined,
);

export default prisma;
