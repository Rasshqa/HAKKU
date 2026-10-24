"use client";

import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();

export const { signIn, signOut, useSession, getSession } = authClient;

/**
 * Memulai alur autentikasi Google OAuth melalui Neon Auth
 * Mendukung domain produksi hakku.biz.id maupun localhost development
 */
export async function signInWithGoogle(callbackUrl?: string) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://hakku.biz.id";

  const targetCallback = callbackUrl || `${origin}/akun`;

  return authClient.signIn.social({
    provider: "google",
    callbackURL: targetCallback,
  });
}
