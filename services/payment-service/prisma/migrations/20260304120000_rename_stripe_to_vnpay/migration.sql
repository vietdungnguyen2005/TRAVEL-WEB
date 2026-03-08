-- Rename Stripe columns to VNPay columns
ALTER TABLE "payment"."Payment" RENAME COLUMN "stripePaymentIntentId" TO "vnpTransactionNo";
ALTER TABLE "payment"."Payment" RENAME COLUMN "stripeCheckoutSessionId" TO "vnpTxnRef";

-- Update default currency from usd to vnd
ALTER TABLE "payment"."Payment" ALTER COLUMN "currency" SET DEFAULT 'vnd';
