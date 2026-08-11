"use client";

import { useAuth } from "@/components/auth/AuthContext";

/**
 * Chrome shared by every page under `/account`: the signed-in guard and the
 * page heading.
 *
 * Navigation between the account pages and logging out both live in the
 * navbar's profile menu, so neither is repeated here.
 *
 * The guard returning early means `children` never mount for a signed-out
 * visitor — each page's body can rely on there being a customer.
 */
export default function AccountShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="px-6 py-20 text-center text-gray-500">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-lg font-semibold">You&apos;re not signed in</p>
        <p className="mt-2 text-gray-500">
          Use the profile icon in the header to sign in or create an account.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full px-[clamp(16px,4vw,80px)] py-10">
      <div className="mb-6">
        <h1 className="text-[32px] leading-tight font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>

      {children}
    </div>
  );
}
