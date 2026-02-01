"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// Use the monorepo root Prisma client (generated from /prisma/schema.prisma).
// This repo already seeds `HeroImage` via prisma.heroImage, so we want the same client here.
const client_1 = require("../../../node_modules/.prisma/client");
exports.prisma = new client_1.PrismaClient();
//# sourceMappingURL=prisma.js.map