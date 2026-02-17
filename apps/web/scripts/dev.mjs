import os from "node:os";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

function pickLanIpv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net && net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

const argv = process.argv.slice(2);
let port = Number(process.env.PORT || 3000);

// Support: `npm run dev -- -p 3001` or `--port 3001`
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "-p" || a === "--port") {
    const n = Number(argv[i + 1]);
    if (!Number.isNaN(n) && n > 0) port = n;
  }
}

// Remove port args from pass-through to avoid duplicates (we always set -p explicitly).
const passThrough = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "-p" || a === "--port") {
    i++;
    continue;
  }
  passThrough.push(a);
}

const lanIp = pickLanIpv4();

console.log(`Local:   http://localhost:${port}`);
if (lanIp) console.log(`Network: http://${lanIp}:${port}`);

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

// Bind 0.0.0.0 so the dev server is reachable via the LAN IP.
const child = spawn(process.execPath, [nextBin, "dev", "-H", "0.0.0.0", "-p", String(port), ...passThrough], {
  env: { ...process.env, PORT: String(port) },
  stdio: ["inherit", "pipe", "pipe"],
  shell: false,
});

function rewriteNetworkUrl(chunk) {
  const s = chunk.toString();
  if (!lanIp) return s;
  return s
    .replaceAll(`http://0.0.0.0:${port}`, `http://${lanIp}:${port}`)
    .replaceAll(`http://[::]:${port}`, `http://${lanIp}:${port}`);
}

child.stdout?.on("data", (d) => process.stdout.write(rewriteNetworkUrl(d)));
child.stderr?.on("data", (d) => process.stderr.write(rewriteNetworkUrl(d)));

child.on("exit", (code) => process.exit(code ?? 0));
