// Use the payment-service specific generated Prisma client.
// The custom Prisma generator outputs a client under node_modules/.prisma/payment-client.
import { PrismaClient } from "../../node_modules/.prisma/payment-client";

const prisma: PrismaClient = new PrismaClient();

export default prisma;
