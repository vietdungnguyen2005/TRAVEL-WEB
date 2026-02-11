import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnvProfile } from './load-env-profile';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const services = [
  'auth-service',
  'booking-service',
  'room-service',
  'review-service',
  'payment-service',
  'notification-service',
  'blog-service',
];

async function migrateAll() {
  // Ensure root env + selected profile env are loaded (docker/supabase)
  loadEnvProfile({ cwd: path.join(__dirname, '../..') });

  console.log('Starting migrations for all services...\n');

  const mode = (process.env.PRISMA_MIGRATE_MODE || process.env.NODE_ENV || 'deploy').toLowerCase();
  const prismaCmd = mode === 'dev'
    ? 'npx prisma migrate dev'
    : 'npx prisma migrate deploy --schema=prisma/schema.prisma';
  console.log(`Migration mode: ${mode} (cmd: ${prismaCmd})\n`);

  for (const service of services) {
    const servicePath = path.join(__dirname, '../../services', service);
    console.log(`Migrating ${service}...`);

    try {
      await execAsync(prismaCmd, {
        cwd: servicePath,
        env: { ...process.env }
      });
      console.log(`✓ ${service} migrated successfully\n`);
    } catch (error) {
      console.error(`✗ ${service} migration failed:`, error);
    }
  }

  console.log('All migrations completed!');
}

migrateAll();