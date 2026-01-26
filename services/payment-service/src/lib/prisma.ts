import type { PrismaClient as PrismaClientType } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client') as { PrismaClient: new () => PrismaClientType };

const prisma = new PrismaClient() as any as PrismaClientType;

export default prisma;
