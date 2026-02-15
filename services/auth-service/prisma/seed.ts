/**
 * Seed script for auth-service (schema app_auth).
 * Creates admin user for Supabase / any Postgres DB.
 *
 * Loads env from this service's .env (services/auth-service/.env).
 * Uses AUTH_DATABASE_URL or DATABASE_URL.
 *
 * Run from repo root:  npm run db:seed:auth
 * Or from auth-service:  npm run db:seed   or   npx prisma db seed
 */
import path from 'node:path';
import { config } from 'dotenv';

// Load .env from auth-service root (so each service's .env is used)
config({ path: path.join(__dirname, '..', '.env') });

// Prisma schema expects AUTH_DATABASE_URL; allow .env to only have DATABASE_URL
if (!process.env.AUTH_DATABASE_URL && process.env.DATABASE_URL) {
  process.env.AUTH_DATABASE_URL = process.env.DATABASE_URL;
}

import { PrismaClient } from '../node_modules/.prisma/auth-client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@travel.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin User';

async function main() {
  const url = process.env.AUTH_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error('Missing AUTH_DATABASE_URL or DATABASE_URL (e.g. Supabase connection string)');
  }

  console.log('🌱 Auth seed: creating admin user...');

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password: hashedPassword,
      name: ADMIN_NAME,
      role: 'ADMIN',
      isVerified: true,
    },
    create: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('✅ Admin user ready:', admin.email);
  console.log('   Login: email =', ADMIN_EMAIL, ', password =', ADMIN_PASSWORD);
}

main()
  .catch((e) => {
    console.error('❌ Auth seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
