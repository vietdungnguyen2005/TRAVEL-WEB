-- Ensure schema exists
CREATE SCHEMA IF NOT EXISTS "booking";

-- CreateTable
CREATE TABLE "booking"."processed_events" (
    "id" TEXT NOT NULL,
    "consumer" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "eventType" TEXT,
    "routingKey" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "processed_events_consumer_processedAt_idx" ON "booking"."processed_events"("consumer", "processedAt");

-- CreateIndex (unique)
CREATE UNIQUE INDEX "processed_events_consumer_messageId_key" ON "booking"."processed_events"("consumer", "messageId");
