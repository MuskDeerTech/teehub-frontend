"use client";

import AccountShell from "@/components/account/AccountShell";
import OrderHistory from "@/components/account/OrderHistory";

export default function OrderHistoryPage() {
  return (
    <AccountShell title="My Orders">
      <OrderHistory />
    </AccountShell>
  );
}
