-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "blog";

-- CreateEnum
CREATE TYPE "blog"."PostStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "blog"."Post" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "status" "blog"."PostStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "blog"."Post"("slug");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "blog"."Post"("status");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "blog"."Post"("createdAt");
