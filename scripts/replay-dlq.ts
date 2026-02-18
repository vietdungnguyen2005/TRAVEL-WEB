import { rabbitConnect } from '@travel-web/shared';

type Args = {
  queue: string;
  limit: number;
  dryRun: boolean;
  exchange: string;
  routingKey?: string;
};

function printHelp() {
  // Keep it minimal and CLI-friendly.
  console.log(`Usage:
  ts-node scripts/replay-dlq.ts --queue <dlqQueueName> [--limit 100] [--exchange events] [--routing-key <rk>] [--dry-run]

Examples:
  npm run dlq:replay -- --queue notification.booking_created.dlq --limit 50 --dry-run
  npm run dlq:replay -- --queue booking.payment_completed.dlq --routing-key payment.completed
`);
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    queue: '',
    limit: 100,
    dryRun: false,
    exchange: process.env.RABBITMQ_EXCHANGE || 'events',
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      printHelp();
      process.exit(0);
    }
    if (a === '--queue') args.queue = argv[++i] || '';
    else if (a === '--limit') args.limit = Number(argv[++i] || '100');
    else if (a === '--exchange') args.exchange = argv[++i] || args.exchange;
    else if (a === '--routing-key') args.routingKey = argv[++i];
    else if (a === '--dry-run') args.dryRun = true;
    else {
      console.error(`Unknown arg: ${a}`);
      printHelp();
      process.exit(1);
    }
  }

  if (!args.queue) {
    throw new Error('Missing --queue <dlqQueueName>');
  }
  if (!Number.isFinite(args.limit) || args.limit <= 0) args.limit = 100;
  return args;
}

function tryGetOriginalRoutingKey(headers: unknown): string | undefined {
  if (!headers || typeof headers !== 'object') return undefined;
  const h = headers as Record<string, unknown>;

  const direct = h['x-original-routing-key'];
  if (typeof direct === 'string' && direct.length > 0) return direct;

  const xDeath = h['x-death'];
  if (Array.isArray(xDeath) && xDeath.length > 0) {
    const first = xDeath[0] as Record<string, unknown>;
    const rks = first?.['routing-keys'];
    if (Array.isArray(rks) && typeof rks[0] === 'string') return rks[0];
  }

  const firstDeath = h['x-first-death-routing-key'];
  if (typeof firstDeath === 'string' && firstDeath.length > 0) return firstDeath;

  return undefined;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { channel: ch } = await rabbitConnect();
  if (!ch) throw new Error('RabbitMQ channel not initialized');

  let replayed = 0;

  for (let i = 0; i < args.limit; i++) {
    const msg = await ch.get(args.queue, { noAck: false });
    if (!msg) break;

    const routingKey = args.routingKey || tryGetOriginalRoutingKey(msg.properties.headers) || msg.fields.routingKey;

    if (!routingKey) {
      ch.nack(msg, false, true);
      throw new Error('Cannot determine routing key for message; use --routing-key to override');
    }

    if (args.dryRun) {
      console.log(`[dry-run] Would replay messageId=${msg.properties.messageId} to ${args.exchange}:${routingKey}`);
      ch.ack(msg);
      replayed++;
      continue;
    }

    ch.publish(args.exchange, routingKey, msg.content, {
      persistent: true,
      contentType: msg.properties.contentType || 'application/json',
      messageId: msg.properties.messageId,
      correlationId: msg.properties.correlationId,
      headers: {
        ...(msg.properties.headers || {}),
        'x-replayed-from-dlq': args.queue,
        'x-replayed-at': new Date().toISOString(),
      },
    });

    ch.ack(msg);
    replayed++;
    console.log(`Replayed ${replayed}: messageId=${msg.properties.messageId} -> ${routingKey}`);
  }

  console.log(`Done. Replayed=${replayed}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
