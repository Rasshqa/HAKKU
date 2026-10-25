"use client";

import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();

export const { signIn, signOut, useSession, getSession } = authClient;

/**
 * Memulai alur autentikasi Google OAuth
 * Mendukung domain produksi www.hakku.biz.id, hakku.biz.id, maupun localhost development
 */
export async function signInWithGoogle(callbackUrl?: string) {
  let origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://www.hakku.biz.id";

  // Normalisasi domain utama Vercel (mencegah loop 308 redirect)
  if (origin === "https://hakku.biz.id") {
    origin = "https://www.hakku.biz.id";
  }

  let targetCallback: string;
  if (!callbackUrl) {
    targetCallback = `${origin}/akun`;
  } else if (callbackUrl.startsWith("/")) {
    targetCallback = `${origin}${callbackUrl}`;
  } else {
    targetCallback = callbackUrl;
  }

  const result = await authClient.signIn.social({
    provider: "google",
    callbackURL: targetCallback,
  });

  // Pastikan browser segera diarahkan jika provider mengembalikan redirect URL langsung
  if (
    typeof window !== "undefined" &&
    result &&
    "data" in result &&
    result.data &&
    typeof (result.data as { url?: string }).url === "string"
  ) {
    window.location.href = (result.data as { url: string }).url;
  }

  return result;
}
