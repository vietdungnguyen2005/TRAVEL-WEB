-- Ensure schema exists
CREATE SCHEMA IF NOT EXISTS "payment";

-- Extend enum for refund workflows (safe to run multiple times)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'PaymentStatus' AND n.nspname = 'payment'
  ) THEN
    BEGIN
      ALTER TYPE "payment"."PaymentStatus" ADD VALUE IF NOT EXISTS 'REFUND_REQUESTED';
      ALTER TYPE "payment"."PaymentStatus" ADD VALUE IF NOT EXISTS 'REFUND_APPROVED';
      ALTER TYPE "payment"."PaymentStatus" ADD VALUE IF NOT EXISTS 'REFUND_REJECTED';
    EXCEPTION WHEN others THEN
      -- Ignore if the Postgres version doesn't support IF NOT EXISTS; handled by deploy pipeline.
    END;
  END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "payment"."IdempotencyKey" (
  "scope" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "bookingId" TEXT,
  "statusCode" INTEGER,
  "response" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("scope", "key")
);

-- Index
CREATE INDEX IF NOT EXISTS "IdempotencyKey_bookingId_idx" ON "payment"."IdempotencyKey"("bookingId");
