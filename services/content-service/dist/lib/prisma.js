"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const content_client_1 = require(".prisma/content-client");
function buildDatasourceUrl() {
    const raw = process.env.DATABASE_URL;
    if (!raw)
        return undefined;
    if (/connection_limit=/i.test(raw))
        return raw;
    const sep = raw.includes('?') ? '&' : '?';
    return `${raw}${sep}connection_limit=5`;
}
const dsUrl = buildDatasourceUrl();
exports.prisma = new content_client_1.PrismaClient(dsUrl ? { datasources: { db: { url: dsUrl } } } : undefined);
//# sourceMappingURL=prisma.js.map