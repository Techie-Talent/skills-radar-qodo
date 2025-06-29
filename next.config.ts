import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // Experimental features
  serverExternalPackages: ["@prisma/client"],

  // Environment variables that should be available at build time
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    ALLOWED_EMAIL_DOMAIN: process.env.ALLOWED_EMAIL_DOMAIN,
  },
};

export default nextConfig;