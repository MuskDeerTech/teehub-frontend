"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Customer } from "../../../payload-types";

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

interface AuthContextValue {
  user: Customer | null;
  loading: boolean;
  /** Accepts an email or a phone number (resolved server-side). */
  login: (identifier: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<{ email: string }>;
  verifyEmail: (email: string, code: string, password: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  requestPasswordReset: (
    identifier: string,
    options?: { sendCode?: boolean },
  ) => Promise<{ email: string }>;
  resetPassword: (email: string, code: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Customer>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export class AuthApiError extends Error {
  code?: string;
  email?: string;

  constructor(message: string, options?: { code?: string; email?: string }) {
    super(message);
    this.name = "AuthApiError";
    this.code = options?.code;
    this.email = options?.email;
  }
}

/**
 * All requests are same-origin to Payload's REST API; `credentials: "include"`
 * sends/receives the HTTP-only `payload-token` cookie Payload sets on login.
 * The token is never read in JS — login state is derived from `/me`.
 *
 * `cache: "no-store"` is not optional. Our host stamps `Cache-Control:
 * max-age=7200` onto every 200 response, `/me` included, so the browser would
 * otherwise replay a stale `{"user":null}` for two hours and show a signed-in
 * customer as logged out on every fresh tab. This overrides response headers
 * outright, so no proxy or CDN setting can reintroduce the bug.
 */
const api = (path: string, init?: RequestInit) =>
  fetch(`/api/customers${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
    cache: "no-store",
  });

async function errorMessage(res: Response, fallback: string) {
  try {
    const data = await res.json();
    return data?.errors?.[0]?.message || data?.message || fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount: the cookie (if any) authenticates this call.
  useEffect(() => {
    let active = true;
    api("/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) setUser(data?.user ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Hits our custom email-or-phone route, which proxies to Payload's /login.
  const login = useCallback(async (identifier: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    if (!res.ok) {
      let data: { code?: string; email?: string; errors?: { message?: string }[]; message?: string } = {};
      try {
        data = await res.json();
      } catch {}
      throw new AuthApiError(
        data?.errors?.[0]?.message || data?.message || "Invalid login or password.",
        { code: data?.code, email: data?.email },
      );
    }
    const data = await res.json();
    setUser(data.user as Customer);
  }, []);

  const register = useCallback(
    async ({ fullName, email, password, phone }: RegisterInput) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, phone }),
      });
      if (!res.ok) {
        const message = await errorMessage(res, "Could not create account.");
        // Payload reports a duplicate email as "invalid: email" — clarify it.
        throw new Error(
          /invalid: ?email|already/i.test(message)
            ? "An account with this email already exists. Try signing in instead."
            : message,
        );
      }
      const data = await res.json();
      return { email: String(data.email ?? email).toLowerCase() };
    },
    [],
  );

  const verifyEmail = useCallback(
    async (email: string, code: string, password: string) => {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      if (!res.ok) {
        throw new Error(await errorMessage(res, "Could not verify email."));
      }
      const data = await res.json();
      if (data?.user) setUser(data.user as Customer);
      else await login(email, password);
    },
    [login],
  );

  const resendVerificationCode = useCallback(async (email: string) => {
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      throw new Error(await errorMessage(res, "Could not send a new code."));
    }
  }, []);

  const requestPasswordReset = useCallback(
    async (identifier: string, options?: { sendCode?: boolean }) => {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, sendCode: options?.sendCode }),
      });
      if (!res.ok) {
        throw new Error(await errorMessage(res, "Could not send a reset code."));
      }
      const data = await res.json();
      return { email: String(data.email ?? identifier).toLowerCase() };
    },
    [],
  );

  const resetPassword = useCallback(
    async (email: string, code: string, password: string) => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      if (!res.ok) {
        throw new Error(await errorMessage(res, "Could not reset password."));
      }
      const data = await res.json();
      if (data?.user) setUser(data.user as Customer);
      else await login(email, password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    await api("/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<Customer>) => {
      if (!user) throw new Error("You must be signed in.");
      const res = await api(`/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error(await errorMessage(res, "Could not save your details."));
      }
      const result = await res.json();
      setUser((result.doc ?? result) as Customer);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      register,
      verifyEmail,
      resendVerificationCode,
      requestPasswordReset,
      resetPassword,
      logout,
      updateProfile,
    }),
    [
      user,
      loading,
      login,
      register,
      verifyEmail,
      resendVerificationCode,
      requestPasswordReset,
      resetPassword,
      logout,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
