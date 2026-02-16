-- Ensure schema exists
CREATE SCHEMA IF NOT EXISTS "app_auth";

-- CreateTable
CREATE TABLE IF NOT EXISTS "app_auth"."email_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "email_verifications_userId_key" ON "app_auth"."email_verifications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "email_verifications_token_key" ON "app_auth"."email_verifications"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "email_verifications_expiresAt_idx" ON "app_auth"."email_verifications"("expiresAt");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'email_verifications_userId_fkey'
    ) THEN
        ALTER TABLE "app_auth"."email_verifications"
        ADD CONSTRAINT "email_verifications_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "app_auth"."User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
