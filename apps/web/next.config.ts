import type { NextConfig } from "next";
import os from "node:os";

function getDevAllowedOrigins(port: number) {
  const origins = new Set<string>([
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
  ]);

  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (!net || net.family !== "IPv4" || net.internal) continue;
      origins.add(`http://${net.address}:${port}`);
    }
  }

  return Array.from(origins);
}

const devPort = Number(process.env.PORT ?? 3000);

const nextConfig: NextConfig = {
  // On Windows, filesystem cache can cause "Persisting failed" / compaction lock errors.
  // Disable dev cache to avoid file-in-use issues (slower cold start, fewer lock errors).
  experimental: {
    turbopackFileSystemCacheForDev: process.platform === "win32" ? false : undefined,
  },
  // Allow dev assets to be loaded when you open the site via LAN IP.
  // Next's dev server can consider these cross-origin for /_next/*.
  // Note: wildcards ("*") are NOT supported here.
  // Requires a full `next dev` restart (not just hot reload).
  allowedDevOrigins: getDevAllowedOrigins(devPort),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
