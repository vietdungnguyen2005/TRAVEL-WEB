const { execSync } = require('node:child_process');
const http = require('node:http');
const { Client } = require('pg');

function hasDocker() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const DOCKER_AVAILABLE = hasDocker();

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpRequestJson(method, url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        method,
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        headers: {
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          const status = res.statusCode || 0;
          try {
            const json = data ? JSON.parse(data) : null;
            if (status >= 200 && status < 300) return resolve({ status, json });
            return reject(new Error(`HTTP ${status}: ${data}`));
          } catch (e) {
            return reject(e);
          }
        });
      },
    );

    req.on('error', reject);
    req.write(JSON.stringify(body || {}));
    req.end();
  });
}

async function waitForHttpOk(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const u = new URL(url);
        const req = http.request(
          { method: 'GET', hostname: u.hostname, port: u.port, path: u.pathname + u.search },
          (res) => {
            res.resume();
            if ((res.statusCode || 0) >= 200 && (res.statusCode || 0) < 300) return resolve();
            return reject(new Error(`HTTP ${res.statusCode}`));
          },
        );
        req.on('error', reject);
        req.end();
      });
      return;
    } catch {
      await sleep(500);
    }
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function waitForDbCondition({ connectionString, query, params, predicate, timeoutMs }) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const client = new Client({ connectionString });
    try {
      await client.connect();
      const res = await client.query(query, params);
      if (predicate(res.rows)) return res.rows;
    } finally {
      await client.end().catch(() => {});
    }
    await sleep(800);
  }
  throw new Error('Timeout waiting for DB condition');
}

describe('Queue integration: booking -> outbox -> payment -> confirm -> notification', () => {
  const composeFile = 'docker-compose.queue.yml';

  const itOrSkip = DOCKER_AVAILABLE ? test : test.skip;

  beforeAll(() => {
    if (!DOCKER_AVAILABLE) return;
    execSync(`docker compose -f ${composeFile} --profile full up -d --build`, { stdio: 'inherit' });
  });

  afterAll(() => {
    if (!DOCKER_AVAILABLE) return;
    try {
      execSync(`docker compose -f ${composeFile} --profile full down -v`, { stdio: 'inherit' });
    } catch {
      // ignore
    }
  });

  itOrSkip('publishes booking.created and results in booking CONFIRMED + notification row', async () => {
    await waitForHttpOk('http://localhost:3002/ready', 60000);
    await waitForHttpOk('http://localhost:3004/healthz', 60000);
    await waitForHttpOk('http://localhost:3006/health', 60000);

    const checkIn = new Date();
    const checkOut = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { json: booking } = await httpRequestJson('POST', 'http://localhost:3002/api/bookings', {
      userId: 'user-test',
      roomId: 'room-test',
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      totalPrice: '100.00',
      numberOfGuests: 1,
    });

    expect(booking).toBeTruthy();
    expect(typeof booking.id).toBe('string');

    const bookingDb = 'postgresql://postgres:postgres@localhost:55432/booking_db';
    const notificationDb = 'postgresql://postgres:postgres@localhost:55432/notification_db';

    await waitForDbCondition({
      connectionString: bookingDb,
      query: 'SELECT id, status, "paymentStatus" FROM booking.bookings WHERE id = $1',
      params: [booking.id],
      predicate: (rows) => rows.length === 1 && rows[0].status === 'CONFIRMED',
      timeoutMs: 90000,
    });

    await waitForDbCondition({
      connectionString: notificationDb,
      query: 'SELECT id, type, status FROM notify.notifications WHERE "bookingId" = $1 ORDER BY "createdAt" DESC',
      params: [booking.id],
      predicate: (rows) => rows.some((r) => r.type === 'PaymentCompleted' || r.type === 'BookingConfirmed' || r.type === 'BookingCreated'),
      timeoutMs: 90000,
    });
  });
});
