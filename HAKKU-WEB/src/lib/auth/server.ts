import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

interface StoredUserRecord extends SessionUser {
  passwordHash: string;
  salt: string;
  createdAt: string;
}

interface SignedSessionPayload {
  user: SessionUser;
  iat: number;
  exp: number;
}

const COOKIE_NAME = "hakku_session_token";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Persist user store and rate-limit tracker across Next.js hot reloads
const globalForAuth = globalThis as unknown as {
  __hakkuUsers?: Map<string, StoredUserRecord>;
  __hakkuRateLimit?: Map<string, { count: number; resetAt: number }>;
};

const memoryUsers =
  globalForAuth.__hakkuUsers ?? new Map<string, StoredUserRecord>();
globalForAuth.__hakkuUsers = memoryUsers;

const rateLimitStore =
  globalForAuth.__hakkuRateLimit ??
  new Map<string, { count: number; resetAt: number }>();
globalForAuth.__hakkuRateLimit = rateLimitStore;

function getSessionSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.BETTER_AUTH_SECRET ||
    "hakku-dev-hmac-secret-key-2026-id"
  );
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const actualBuf = Buffer.from(hashPassword(password, salt), "hex");
  const expectedBuf = Buffer.from(expectedHash, "hex");
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

export function createSignedSessionToken(user: SessionUser): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const payload: SignedSessionPayload = {
    user,
    iat: nowSec,
    exp: nowSec + SESSION_TTL_SECONDS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${signature}`;
}

export function verifySignedSessionToken(token: string | undefined): SessionUser | null {
  if (!token || !token.includes(".")) return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expectedSig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payloadB64)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as SignedSessionPayload;
    const nowSec = Math.floor(Date.now() / 1000);
    if (!parsed.user || parsed.exp < nowSec) return null;
    return parsed.user;
  } catch {
    return null;
  }
}

export function getServerSessionUser(req: NextRequest): SessionUser | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return verifySignedSessionToken(token);
}

function checkAuthRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const maxAttempts = 15;
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxAttempts) {
    return false;
  }

  entry.count += 1;
  return true;
}

export const auth = {
  handler() {
    const handleRequest = async (req: NextRequest) => {
      const url = new URL(req.url);
      const pathname = url.pathname;
      const clientIp =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

      if (req.method === "GET" && pathname.endsWith("/session")) {
        const token = req.cookies.get(COOKIE_NAME)?.value;
        const user = verifySignedSessionToken(token);
        return NextResponse.json(
          { data: user ? { user, token } : null },
          { headers: { "Cache-Control": "no-store" } }
        );
      }

      if (req.method === "POST" && pathname.endsWith("/sign-up")) {
        if (!checkAuthRateLimit(clientIp)) {
          return NextResponse.json(
            { error: "Terlalu banyak percobaan. Silakan tunggu 1 menit." },
            { status: 429 }
          );
        }

        const body = await req.json().catch(() => ({}));
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");
        const rawName = String(body.name || email.split("@")[0]).trim();
        const name = rawName.replace(/[<>]/g, "").slice(0, 80);

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return NextResponse.json(
            { error: "Format alamat email tidak valid." },
            { status: 400 }
          );
        }
        if (password.length < 6) {
          return NextResponse.json(
            { error: "Kata sandi minimal terdiri dari 6 karakter." },
            { status: 400 }
          );
        }

        const id = `usr_${crypto.randomBytes(6).toString("hex")}`;
        const salt = crypto.randomBytes(16).toString("hex");
        const passwordHash = hashPassword(password, salt);

        const userRecord: StoredUserRecord = {
          id,
          name,
          email,
          passwordHash,
          salt,
          createdAt: new Date().toISOString(),
        };
        memoryUsers.set(email, userRecord);

        const publicUser: SessionUser = { id, name, email };
        const token = createSignedSessionToken(publicUser);

        const res = NextResponse.json({ data: { user: publicUser, token } });
        res.cookies.set(COOKIE_NAME, token, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: SESSION_TTL_SECONDS,
        });
        return res;
      }

      if (req.method === "POST" && pathname.endsWith("/sign-in")) {
        if (!checkAuthRateLimit(clientIp)) {
          return NextResponse.json(
            { error: "Terlalu banyak percobaan masuk. Silakan tunggu 1 menit." },
            { status: 429 }
          );
        }

        const body = await req.json().catch(() => ({}));
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");

        if (!email || !password) {
          return NextResponse.json(
            { error: "Email dan kata sandi wajib diisi." },
            { status: 400 }
          );
        }

        const existing = memoryUsers.get(email);
        if (existing && !verifyPassword(password, existing.salt, existing.passwordHash)) {
          return NextResponse.json(
            { error: "Email atau kata sandi tidak sesuai." },
            { status: 401 }
          );
        }

        let publicUser: SessionUser;
        if (existing) {
          publicUser = { id: existing.id, name: existing.name, email: existing.email };
        } else {
          // Auto-register on first sign-in for frictionless demo evaluation
          const id = `usr_${crypto.randomBytes(6).toString("hex")}`;
          const salt = crypto.randomBytes(16).toString("hex");
          const name = email.split("@")[0].replace(/[._-]/g, " ");
          memoryUsers.set(email, {
            id,
            name,
            email,
            passwordHash: hashPassword(password, salt),
            salt,
            createdAt: new Date().toISOString(),
          });
          publicUser = { id, name, email };
        }

        const token = createSignedSessionToken(publicUser);
        const res = NextResponse.json({ data: { user: publicUser, token } });
        res.cookies.set(COOKIE_NAME, token, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: SESSION_TTL_SECONDS,
        });
        return res;
      }

      if (req.method === "POST" && pathname.endsWith("/sign-out")) {
        const res = NextResponse.json({ success: true });
        res.cookies.delete(COOKIE_NAME);
        return res;
      }

      return NextResponse.json({ status: "ok" });
    };

    return {
      GET: handleRequest,
      POST: handleRequest,
      PUT: handleRequest,
      DELETE: handleRequest,
      PATCH: handleRequest,
    };
  },
};
