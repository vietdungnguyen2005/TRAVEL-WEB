"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Prisma types can be hoisted/resolved differently in a monorepo.
// Use a runtime require to avoid TS treating PrismaClient as type-only in some configurations.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');
// Cast to `any` so compilation doesn't depend on generated delegate types (booking/outbox).
const prisma = new PrismaClient();
exports.default = prisma;
//# sourceMappingURL=prisma.js.map