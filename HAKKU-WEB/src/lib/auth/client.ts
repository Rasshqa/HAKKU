"use client";

import { useState, useEffect } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthSessionData {
  user: AuthUser;
  token: string;
}

const STORAGE_KEY = "hakku_auth_session_v1";
const USERS_KEY = "hakku_registered_users_v1";

interface StoredUserRecord extends AuthUser {
  passwordHash: string;
}

function readLocalUsers(): StoredUserRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: StoredUserRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

function readLocalSession(): AuthSessionData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocalSession(session: AuthSessionData | null) {
  if (typeof window === "undefined") return;
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new Event("hakku-auth-change"));
  } catch {}
}

export const authClient = {
  async getSession(): Promise<{ data: AuthSessionData | null; error: null }> {
    const local = readLocalSession();
    if (local?.user) {
      return { data: local, error: null };
    }
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.user) {
          writeLocalSession(json.data);
          return { data: json.data, error: null };
        }
      }
    } catch {}
    return { data: null, error: null };
  },

  signUp: {
    async email({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    }): Promise<{ data: AuthSessionData | null; error: { message: string } | null }> {
      const normalizedEmail = email.trim().toLowerCase();
      const cleanName = name.trim() || normalizedEmail.split("@")[0];

      try {
        const res = await fetch("/api/auth/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, password, name: cleanName }),
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.data) {
          writeLocalSession(json.data);
          return { data: json.data, error: null };
        }
        if (json?.error) {
          return { data: null, error: { message: json.error } };
        }
      } catch {}

      // Local fallback for iframe / offline environments
      const users = readLocalUsers();
      if (users.some((u) => u.email === normalizedEmail)) {
        return {
          data: null,
          error: { message: "Alamat email ini sudah terdaftar. Silakan masuk ke akun Anda." },
        };
      }

      const newUser: StoredUserRecord = {
        id: `usr_${Date.now().toString(36)}`,
        name: cleanName,
        email: normalizedEmail,
        passwordHash: btoa(encodeURIComponent(password)),
      };
      saveLocalUsers([...users, newUser]);

      const session: AuthSessionData = {
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
        token: `tok_${Date.now().toString(36)}`,
      };
      writeLocalSession(session);
      return { data: session, error: null };
    },
  },

  signIn: {
    async email({
      email,
      password,
    }: {
      email: string;
      password: string;
    }): Promise<{ data: AuthSessionData | null; error: { message: string } | null }> {
      const normalizedEmail = email.trim().toLowerCase();

      try {
        const res = await fetch("/api/auth/sign-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, password }),
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.data) {
          writeLocalSession(json.data);
          return { data: json.data, error: null };
        }
      } catch {}

      const users = readLocalUsers();
      const existing = users.find((u) => u.email === normalizedEmail);
      if (existing && existing.passwordHash !== btoa(encodeURIComponent(password))) {
        return {
          data: null,
          error: { message: "Kata sandi yang Anda masukkan tidak sesuai." },
        };
      }

      const user: AuthUser = existing
        ? { id: existing.id, name: existing.name, email: existing.email }
        : {
            id: `usr_${Date.now().toString(36)}`,
            name: normalizedEmail.split("@")[0].replace(/[._-]/g, " "),
            email: normalizedEmail,
          };

      const session: AuthSessionData = {
        user,
        token: `tok_${Date.now().toString(36)}`,
      };
      writeLocalSession(session);
      return { data: session, error: null };
    },
  },

  async signOut(): Promise<void> {
    writeLocalSession(null);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch {}
  },

  useSession() {
    const [session, setSession] = useState<AuthSessionData | null>(() => readLocalSession());
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
      const sync = () => {
        setSession(readLocalSession());
        setIsPending(false);
      };
      window.addEventListener("hakku-auth-change", sync);
      window.addEventListener("storage", sync);
      return () => {
        window.removeEventListener("hakku-auth-change", sync);
        window.removeEventListener("storage", sync);
      };
    }, []);

    return { data: session, isPending };
  },
};

export const { signIn, signUp, signOut, useSession } = authClient;
