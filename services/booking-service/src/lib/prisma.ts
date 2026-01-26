import type { PrismaClient as PrismaClientType } from '@prisma/client';

// Prisma types can be hoisted/resolved differently in a monorepo.
// Use a runtime require to avoid TS treating PrismaClient as type-only in some configurations.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client') as { PrismaClient: new () => PrismaClientType };

// Cast to `any` so compilation doesn't depend on generated delegate types (booking/outbox).
const prisma = new PrismaClient() as any as PrismaClientType;

export default prisma;
