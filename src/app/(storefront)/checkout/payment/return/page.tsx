"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  IconCircleCheck,
  IconCircleX,
  IconClock,
} from "@tabler/icons-react";
import { useCart } from "@/components/cart/CartContext";

type ViewState = "verifying" | "paid" | "pending" | "failed" | "missing";

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const { clearCart, closeCart } = useCart();
  const isCod = searchParams.get("cod") === "1";
  const codOrderNumber = searchParams.get("order") || "";
  const [state, setState] = useState<ViewState>("verifying");
  const [orderNumber, setOrderNumber] = useState("");
  const [amount, setAmount] = useState<string | null>(null);
  const [currency, setCurrency] = useState("INR");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Never trust the URL for success: the order number is checked against the
    // signed-in customer's own COD orders before anything is shown.
    if (isCod) {
      const confirm = async () => {
        try {
          const response = await fetch("/api/orders/cod-confirmation", {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderNumber: codOrderNumber }),
          });
          const data = (await response.json().catch(() => null)) as {
            status?: "placed" | "failed";
            orderNumber?: string;
            amount?: string;
            currency?: string;
            errors?: { message?: string }[];
          } | null;
          if (cancelled) return;
          if (!response.ok || !data?.status || !data.orderNumber || !data.amount) {
            setState("failed");
            setMessage(
              data?.errors?.[0]?.message || "We could not find this order.",
            );
            return;
          }

          setOrderNumber(data.orderNumber);
          setAmount(data.amount);
          setCurrency(data.currency || "INR");
          if (data.status === "placed") {
            setState("paid");
            clearCart();
            closeCart();
          } else {
            setState("failed");
            setMessage("This order has been cancelled.");
          }
        } catch {
          if (!cancelled) {
            setState("failed");
            setMessage("We could not reach the server to confirm this order.");
          }
        }
      };

      if (!codOrderNumber) {
        timer = setTimeout(() => {
          if (!cancelled) setState("missing");
        }, 0);
      } else {
        void confirm();
      }
      return () => {
        cancelled = true;
        if (timer) clearTimeout(timer);
      };
    }
    const queryOrderId =
      searchParams.get("order_id") || searchParams.get("orderId") || "";
    let storedOrderId = "";
    try {
      const stored = JSON.parse(
        window.sessionStorage.getItem("teehub-hdfc-payment") || "{}",
      ) as { gatewayOrderId?: string; orderNumber?: string };
      storedOrderId = stored.gatewayOrderId || "";
    } catch {}

    const gatewayOrderId = queryOrderId || storedOrderId;
    if (!gatewayOrderId) {
      timer = setTimeout(() => {
        if (!cancelled) setState("missing");
      }, 0);
      return;
    }

    const verify = async (attempt: number) => {
      try {
        const response = await fetch("/api/payments/hdfc/verify", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gatewayOrderId }),
        });
        const data = (await response.json().catch(() => null)) as {
          status?: "paid" | "pending" | "failed";
          orderNumber?: string;
          gatewayOrderId?: string;
          amount?: string;
          currency?: string;
          errors?: { message?: string }[];
        } | null;
        if (cancelled) return;
        if (!response.ok || !data?.status) {
          setState("failed");
          setMessage(
            data?.errors?.[0]?.message || "We could not verify this payment.",
          );
          return;
        }

        if (!data.gatewayOrderId || !data.amount || !data.currency) {
          setState("failed");
          setMessage("We could not verify the payment details. Please try again.");
          return;
        }
        setOrderNumber(data.gatewayOrderId);
        setAmount(data.amount);
        setCurrency(data.currency);
        setState(data.status);

        if (data.status === "paid") {
          clearCart();
          closeCart();
          window.sessionStorage.removeItem("teehub-hdfc-payment");
        } else if (data.status === "pending" && attempt < 6) {
          timer = setTimeout(() => verify(attempt + 1), 15_000);
        }
      } catch {
        if (!cancelled) {
          setState("failed");
          setMessage("We could not reach the server to verify this payment.");
        }
      }
    };

    void verify(0);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [clearCart, closeCart, codOrderNumber, isCod, searchParams]);

  const paid = state === "paid";
  const pending = state === "pending" || state === "verifying";
  const Icon = paid ? IconCircleCheck : pending ? IconClock : IconCircleX;
  const title = isCod
    ? paid
      ? "Order placed successfully"
      : pending
        ? "Confirming your order"
        : "Order not confirmed"
    : paid
      ? "Payment successful"
      : pending
        ? "Confirming your payment"
        : "Payment not confirmed";

  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-[#f7f7f7] px-5 py-16">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <Icon
          size={58}
          stroke={1.5}
          className={`mx-auto ${paid ? "text-green-600" : pending ? "text-amber-500" : "text-red-500"}`}
        />
        <h1 className="mt-4 text-2xl font-bold text-[#111]">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          {isCod
            ? paid
              ? "We have received your Cash on Delivery order."
              : pending
                ? "Checking your order…"
                : message || "We could not find this order."
            : paid
              ? "Your payment has been received successfully."
              : pending
                ? "The bank has not returned a final status yet. This page will check again automatically."
                : message || "No successful charge was found for this order."}
        </p>
        {orderNumber && (
          <p className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm font-semibold">
            Order: {orderNumber}
          </p>
        )}
        {amount !== null && (
          <p className="mt-2 rounded-lg bg-gray-50 px-4 py-3 text-sm font-semibold">
            Amount: {currency} {amount}
          </p>
        )}

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/account/orders"
            className="rounded-full bg-[#F26522] px-6 py-2.5 text-sm font-semibold text-white"
          >
            View Orders
          </Link>
          {!paid && !pending && (
            <Link
              href="/checkout/payment"
              className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700"
            >
              Try Again
            </Link>
          )}
          <Link
            href="/"
            className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<main className="min-h-[65vh] bg-[#f7f7f7]" />}>
      <PaymentReturnContent />
    </Suspense>
  );
}
