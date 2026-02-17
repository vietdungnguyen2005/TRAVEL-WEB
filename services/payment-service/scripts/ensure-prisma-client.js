/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const clientIndex = path.join(__dirname, '..', 'node_modules', '.prisma', 'payment-client', 'index.d.ts');

if (fs.existsSync(clientIndex)) {
  // Avoid re-generating while the service is running on Windows,
  // which can lock the query engine DLL and cause EPERM.
  console.log('prisma:ensure - Prisma client already present; skipping generate');
  process.exit(0);
}

const prismaCmd = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';
const result = spawnSync(prismaCmd, ['generate', '--schema=prisma/schema.prisma'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: false,
});

process.exit(typeof result.status === 'number' ? result.status : 1);
