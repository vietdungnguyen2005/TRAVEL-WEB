-- Ensure schema exists
CREATE SCHEMA IF NOT EXISTS "notify";

-- CreateEnum
CREATE TYPE "notify"."NotificationChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "notify"."NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "notify"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "bookingId" TEXT,
    "type" TEXT NOT NULL,
    "channel" "notify"."NotificationChannel" NOT NULL DEFAULT 'EMAIL',
    "to" TEXT NOT NULL,
    "subject" TEXT,
    "payload" JSONB,
    "status" "notify"."NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_status_createdAt_idx" ON "notify"."notifications"("status", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notify"."notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_bookingId_idx" ON "notify"."notifications"("bookingId");
