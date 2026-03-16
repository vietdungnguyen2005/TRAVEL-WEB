"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blog_client_1 = require("../../node_modules/.prisma/blog-client");
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
const prisma = new blog_client_1.PrismaClient(dsUrl ? { datasources: { db: { url: dsUrl } } } : undefined);
exports.default = prisma;
//# sourceMappingURL=prisma.js.map