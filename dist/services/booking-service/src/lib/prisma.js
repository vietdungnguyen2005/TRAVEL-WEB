// Prisma types can be hoisted/resolved differently in a monorepo.
// Use a runtime require to avoid TS treating PrismaClient as type-only in some configurations.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');
// Cast to `any` so compilation doesn't depend on generated delegate types (booking/outbox).
const prisma = new PrismaClient();
export default prisma;
//# sourceMappingURL=prisma.js.map