export const publicEnv = {
    // Default for local dev/build. In production, set NEXT_PUBLIC_API_GATEWAY_URL explicitly.
    NEXT_PUBLIC_API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://localhost:4000",
} as const;
