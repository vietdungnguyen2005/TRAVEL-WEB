// Use the monorepo root Prisma client (generated from /prisma/schema.prisma).
// This repo already seeds `HeroImage` via prisma.heroImage, so we want the same client here.
import { PrismaClient } from '../../../node_modules/.prisma/client';

export const prisma: PrismaClient = new PrismaClient();
