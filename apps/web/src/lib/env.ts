// Environment variables validation
// This file validates that all required environment variables are present

const requiredEnvVars = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
] as const;

const optionalEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
  "RESEND_API_KEY",
  "FROM_EMAIL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_APP_NAME",
  "VNPAY_TMN_CODE",
  "VNPAY_HASH_SECRET",
  "VNPAY_URL",
] as const;

export function validateEnv() {
  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.join("\n")}\n\nPlease check your .env file.`
    );
  }

  // Warn about missing optional variables
  const missingOptional: string[] = [];
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      missingOptional.push(envVar);
    }
  }

  if (missingOptional.length > 0 && process.env.NODE_ENV === "development") {
    console.warn(
      "⚠️  Warning: Some optional environment variables are missing:",
      missingOptional.join(", ")
    );
  }
}

// Validate on import (only in Node.js environment)
if (typeof window === "undefined") {
  try {
    validateEnv();
  } catch (error) {
    console.error("❌ Environment validation failed:");
    console.error(error);
    // Don't throw in production to prevent crashes, but log the error
    if (process.env.NODE_ENV === "development") {
      throw error;
    }
  }
}
