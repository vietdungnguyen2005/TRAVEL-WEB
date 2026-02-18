-- Add outbox locking/attempt fields for safe polling publisher
ALTER TABLE "booking"."outbox"
  ADD COLUMN IF NOT EXISTS "lockedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lockExpiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lockedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "publishAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lastError" TEXT;

-- Helpful index for claiming pending rows
CREATE INDEX IF NOT EXISTS "outbox_published_lockExpiresAt_createdAt_idx"
  ON "booking"."outbox" ("published", "lockExpiresAt", "createdAt");
