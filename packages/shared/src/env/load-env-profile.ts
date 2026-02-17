import fs from "node:fs";
import path from "node:path";

type Profile = "docker" | "supabase";

function parseDotenv(content: string): Record<string, string> {
  const out: Record<string, string> = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const idx = line.indexOf("=");
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    out[key] = value;
  }

  return out;
}

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  const vars = parseDotenv(content);
  for (const [k, v] of Object.entries(vars)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

export function loadEnvProfile(opts?: { cwd?: string }) {
  const root = opts?.cwd ?? process.cwd();

  // Base .env
  loadEnvFile(path.join(root, ".env"));

  const profile = (process.env.ENV_PROFILE as Profile | undefined) ?? "docker";
  const profileFile = profile === "supabase" ? ".env.supabase" : ".env.docker";

  loadEnvFile(path.join(root, profileFile));

  return { profile, profileFile };
}
