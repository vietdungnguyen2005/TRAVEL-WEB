"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const module_1 = require("module");
const generatedClientPath = path_1.default.join(process.cwd(), 'node_modules', '.prisma', 'booking-client');
const requireFromHere = (0, module_1.createRequire)(__filename);
const { PrismaClient } = requireFromHere(generatedClientPath);
const prisma = new PrismaClient();
exports.default = prisma;
//# sourceMappingURL=prisma.js.map