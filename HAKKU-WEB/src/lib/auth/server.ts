import { createNeonAuth } from "@neondatabase/auth/next/server";
import { NextRequest } from "next/server";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

const baseUrl =
  process.env.NEON_AUTH_BASE_URL ||
  "https://ep-frosty-king-b55chdqv.neonauth.c-7.us-east-2.aws.neon.tech/neondb/auth";

const secret =
  process.env.NEON_AUTH_COOKIE_SECRET ||
  process.env.AUTH_SECRET ||
  "fallback_secret_32_characters_minimum_security_key!";

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret,
    sessionDataTtl: 300,
  },
});

/**
 * Mendapatkan user session di server-side (Next.js Server Components & Route Handlers)
 */
export async function getServerSessionUser(_req?: NextRequest): Promise<SessionUser | null> {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) return null;
    return {
      id: session.user.id,
      name: session.user.name || "",
      email: session.user.email || "",
      image: (session.user as { image?: string }).image,
    };
  } catch {
    return null;
  }
}
