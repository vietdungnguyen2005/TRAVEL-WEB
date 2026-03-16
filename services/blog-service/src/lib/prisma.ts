import { PrismaClient } from '../../node_modules/.prisma/blog-client';

function buildDatasourceUrl(): string | undefined {
	const raw = process.env.DATABASE_URL;
	if (!raw) return undefined;
	if (/connection_limit=/i.test(raw)) return raw;
	const sep = raw.includes('?') ? '&' : '?';
	return `${raw}${sep}connection_limit=2`;
}

const dsUrl = buildDatasourceUrl();
const prisma: PrismaClient = new PrismaClient(
	dsUrl ? { datasources: { db: { url: dsUrl } } } : undefined,
);

export default prisma;
