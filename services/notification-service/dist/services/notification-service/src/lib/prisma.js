"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notification_client_1 = require(".prisma/notification-client");
// Note: model typings depend on `prisma generate` output. Keep this loosely typed
// so the service can compile in CI/builds even if generation hasn't run yet.
const prisma = new notification_client_1.PrismaClient();
exports.default = prisma;
//# sourceMappingURL=prisma.js.map