"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AccountShell from "@/components/account/AccountShell";
import ProfileDetails from "@/components/account/ProfileDetails";

export default function AccountPage() {
  return (
    <Suspense
      fallback={<p className="px-6 py-20 text-center text-gray-500">Loading…</p>}
    >
      <AccountProfileView />
    </Suspense>
  );
}

/** Split out because `useSearchParams` has to sit inside a Suspense boundary. */
function AccountProfileView() {
  const isWelcome = useSearchParams().get("welcome") === "1";

  return (
    <AccountShell
      title={isWelcome ? "Welcome to TeeHub!" : "My Account"}
      subtitle={isWelcome ? "Add your details to speed up checkout." : undefined}
    >
      <ProfileDetails isWelcome={isWelcome} />
    </AccountShell>
  );
}
