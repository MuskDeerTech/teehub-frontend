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
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Customer>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * All requests are same-origin to Payload's REST API; `credentials: "include"`
 * sends/receives the HTTP-only `payload-token` cookie Payload sets on login.
 * The token is never read in JS — login state is derived from `/me`.
 */
const api = (path: string, init?: RequestInit) =>
  fetch(`/api/customers${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
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
      throw new Error(await errorMessage(res, "Invalid login or password."));
    }
    const data = await res.json();
    setUser(data.user as Customer);
  }, []);

  const register = useCallback(
    async ({ fullName, email, password, phone }: RegisterInput) => {
      const res = await api("", {
        method: "POST",
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
      // Creating an account does not start a session, so log in right after.
      await login(email, password);
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
    () => ({ user, loading, login, register, logout, updateProfile }),
    [user, loading, login, register, logout, updateProfile],
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
