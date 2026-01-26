import { PrismaClient } from '.prisma/notification-client';

// Note: model typings depend on `prisma generate` output. Keep this loosely typed
// so the service can compile in CI/builds even if generation hasn't run yet.
const prisma: any = new PrismaClient();

export default prisma;
