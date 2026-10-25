import { auth } from "@/lib/auth/server";
import { NextRequest, NextResponse } from "next/server";

const authMiddleware = auth.middleware({
  loginUrl: "/auth/masuk",
});

// Halaman yang membutuhkan sesi autentikasi pengguna:
// 1. /akun (Ruang data pribadi dan dokumen tersimpan)
// 2. /konsultasi (Wawancara AI interaktif berbasis Gemini)
// 3. /pendampingan (Alur pendampingan terpandu berbasis AI)
const PROTECTED_ROUTES = ["/akun", "/konsultasi", "/pendampingan"];

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Wajib tangkap verifier OAuth dari Neon Auth (neon_auth_session_verifier).
  // Neon Auth middleware menukar token ini menjadi session cookie resmi pada response.
  const isOAuthCallback = searchParams.has("neon_auth_session_verifier");
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isOAuthCallback) {
    return authMiddleware(request);
  }

  if (isProtectedRoute) {
    const response = await authMiddleware(request);

    // Jika pengguna belum login dan diarahkan ke loginUrl (/auth/masuk),
    // pastikan membawa callbackUrl ke fitur AI yang dituju agar kembali otomatis setelah login
    if (
      response.status === 307 ||
      response.status === 302 ||
      response.status === 303
    ) {
      const location = response.headers.get("location");
      if (location && location.includes("/auth/masuk")) {
        const redirectUrl = new URL(location, request.url);
        if (!redirectUrl.searchParams.has("callbackUrl")) {
          redirectUrl.searchParams.set("callbackUrl", pathname);
          return NextResponse.redirect(redirectUrl, {
            headers: response.headers,
          });
        }
      }
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes ditangani langsung oleh route handlers)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - asset file statis (.png, .svg, .ico, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
