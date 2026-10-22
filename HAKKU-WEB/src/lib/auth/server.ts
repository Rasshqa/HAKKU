import { createNeonAuth } from "@neondatabase/auth/next/server";

if (!process.env.NEON_AUTH_BASE_URL) {
  console.warn("[HAKKU AUTH] NEON_AUTH_BASE_URL is not defined in environment variables.");
}

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL || "https://placeholder.neonauth.aws.neon.tech/neondb/auth",
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || "fallback_secret_32_characters_minimum_security_key!",
    sessionDataTtl: 300, // 5 menit cache sesi
  },
});
