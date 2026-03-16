#!/usr/bin/env node
/**
 * kill-ports.js – Cross-platform utility to kill processes on dev ports.
 * Works reliably on Windows (PowerShell & cmd), macOS, Linux.
 */
const { execSync } = require('child_process');

const PORTS = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 4000];
const isWin = process.platform === 'win32';

function killPortsWindows() {
  let killed = 0;
  const pids = new Set();
  const myPid = process.pid.toString();
  // Collect the entire process ancestry to avoid killing ourselves or npm
  const safePids = new Set([myPid]);
  try {
    // Walk up the parent chain
    let ppid = process.ppid ? process.ppid.toString() : '';
    safePids.add(ppid);
    // Also get grandparent via wmic (npm → cmd → node chain)
    const wmicOut = execSync(
      `wmic process where "ProcessId=${ppid}" get ParentProcessId /format:value`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    const gpMatch = wmicOut.match(/ParentProcessId=(\d+)/);
    if (gpMatch) safePids.add(gpMatch[1]);
  } catch { /* ignore */ }

  for (const port of PORTS) {
    try {
      const out = execSync(`netstat -ano | findstr "LISTENING" | findstr ":${port} "`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      for (const line of out.trim().split('\n')) {
        const pid = line.trim().split(/\s+/).pop();
        if (pid && pid !== '0' && /^\d+$/.test(pid) && !safePids.has(pid)) {
          pids.add(pid);
        }
      }
    } catch { /* port not in use */ }
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
      killed++;
    } catch { /* already dead */ }
  }

  // Kill child processes of the port-listening PIDs (ts-node-dev spawns children)
  for (const pid of pids) {
    try {
      const out = execSync(
        `wmic process where "ParentProcessId=${pid}" get ProcessId /format:value`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      for (const match of out.matchAll(/ProcessId=(\d+)/g)) {
        const childPid = match[1];
        if (!safePids.has(childPid)) {
          try {
            execSync(`taskkill /F /PID ${childPid}`, { stdio: 'pipe' });
            killed++;
          } catch { /* already dead */ }
        }
      }
    } catch { /* no children */ }
  }

  return killed;
}

function killPortsUnix() {
  let killed = 0;
  for (const port of PORTS) {
    try {
      execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: 'pipe' });
      killed++;
    } catch { /* port not in use */ }
  }
  return killed;
}

const killed = isWin ? killPortsWindows() : killPortsUnix();
if (killed > 0) console.log(`[kill-ports] Killed ${killed} process(es)`);

// Wait for OS to release sockets
const wait = killed > 0 ? 2000 : 500;
setTimeout(() => {
  console.log('[kill-ports] Ports cleared');
  process.exit(0);
}, wait);
