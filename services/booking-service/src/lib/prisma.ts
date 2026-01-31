// Use the booking-service specific generated Prisma client.
// In this monorepo, node_modules is hoisted to the repo root.
import { PrismaClient } from "../../node_modules/.prisma/booking-client";

const prisma: PrismaClient = new PrismaClient();

export default prisma;
