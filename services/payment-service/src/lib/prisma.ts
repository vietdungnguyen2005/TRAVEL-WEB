import path from 'path';

import { createRequire } from 'module';
import type { PrismaClient as GeneratedPrismaClient } from '../../node_modules/.prisma/payment-client';

const generatedClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'payment-client');
const requireFromHere = createRequire(__filename);

const { PrismaClient, Prisma } = requireFromHere(generatedClientPath) as unknown as {
	PrismaClient: new () => GeneratedPrismaClient;
	Prisma: {
		JsonNull: unknown;
	};
};

const prisma: GeneratedPrismaClient = new PrismaClient();

export { Prisma };
export default prisma;
