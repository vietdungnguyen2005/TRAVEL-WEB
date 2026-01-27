"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Use the booking-service specific generated Prisma client.
// In this monorepo, node_modules is hoisted to the repo root.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('../../node_modules/.prisma/booking-client');
const prisma = new PrismaClient();
exports.default = prisma;
//# sourceMappingURL=prisma.js.map