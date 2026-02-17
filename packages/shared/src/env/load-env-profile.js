"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnvProfile = loadEnvProfile;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function parseDotenv(content) {
    const out = {};
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#"))
            continue;
        const idx = line.indexOf("=");
        if (idx === -1)
            continue;
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        out[key] = value;
    }
    return out;
}
function loadEnvFile(filePath) {
    if (!node_fs_1.default.existsSync(filePath))
        return;
    const content = node_fs_1.default.readFileSync(filePath, "utf8");
    const vars = parseDotenv(content);
    for (const [k, v] of Object.entries(vars)) {
        if (process.env[k] === undefined)
            process.env[k] = v;
    }
}
function loadEnvProfile(opts) {
    const root = opts?.cwd ?? process.cwd();
    // Base .env
    loadEnvFile(node_path_1.default.join(root, ".env"));
    const profile = process.env.ENV_PROFILE ?? "docker";
    const profileFile = profile === "supabase" ? ".env.supabase" : ".env.docker";
    loadEnvFile(node_path_1.default.join(root, profileFile));
    return { profile, profileFile };
}
//# sourceMappingURL=load-env-profile.js.map