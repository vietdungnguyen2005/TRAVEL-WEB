"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Use the booking-service specific generated Prisma client.
// In this monorepo, node_modules is hoisted to the repo root.
const booking_client_1 = require("../../node_modules/.prisma/booking-client");
const prisma = new booking_client_1.PrismaClient();
exports.default = prisma;
//# sourceMappingURL=prisma.js.map