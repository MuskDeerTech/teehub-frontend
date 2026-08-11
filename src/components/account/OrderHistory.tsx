"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconEye,
  IconRefresh,
  IconSearch,
  IconStar,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useCart } from "@/components/cart/CartContext";
import RequestExchangeModal from "@/components/account/RequestExchangeModal";
import type { ExchangeReason } from "@/lib/orders/exchange";

type OrderItem = {
  /** Present at depth 0 as the raw product id; used to key the cart line. */
  product?: string | number;
  name: string;
  image?: string;
  size?: string;
  /** Variant snapshot taken at purchase time — both can be blank. */
  color?: string;
  material?: string;
  quantity: number;
  price: number;
  mrp?: number;
  customName?: string;
  /** This particular line is the one being exchanged. */
  exchanged?: boolean;
};

/**
 * Exchange/return state for an order. `state` doubles as the presence flag:
 * Payload always returns the group, so an exchange only counts as raised once
 * someone has picked a state for it.
 */
type OrderExchange = {
  state?: "accepted" | "pending" | null;
  reason?: string;
  reference?: string;
};

type Order = {
  id: string | number;
  orderNumber: string;
  status?: string;
  originalCreatedAt?: string;
  deliveredAt?: string;
  totalPrice?: number;
  totalMrp?: number;
  totalCount?: number;
  refundedTotal?: number;
  items?: OrderItem[];
  payment?: { method?: string; status?: string };
  exchange?: OrderExchange;
  // The order's shipping snapshot lives at the document root (Payload unnamed
  // tabs don't nest), so these come back at depth 0 with everything else.
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

/** An exchange exists only once it has a state — see OrderExchange. */
const exchangeOf = (order: Order) =>
  order.exchange?.state ? (order.exchange as Required<OrderExchange>) : null;

/** The line the exchange modal is collecting a reason for. */
type ExchangeTarget = {
  orderId: string | number;
  itemIndex: number;
  itemName: string;
};

type OrderTab = "all" | "cancelled" | "refund" | "return" | "review";

const TABS: { id: OrderTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "cancelled", label: "Cancelled" },
  { id: "refund", label: "Refund" },
  { id: "return", label: "Return" },
  { id: "review", label: "To Review" },
];

/**
 * Which orders each tab shows.
 *
 * All but one read real fields. `review` approximates "delivered, so you could
 * review it" — telling which of those you have *already* reviewed would need a
 * second query against `reviews`.
 */
function matchesTab(order: Order, tab: OrderTab): boolean {
  switch (tab) {
    case "cancelled":
      return order.status === "cancelled";
    case "refund":
      return (
        order.payment?.status === "refunded" || (order.refundedTotal ?? 0) > 0
      );
    case "return":
      return exchangeOf(order) != null;
    case "review":
      return order.status === "delivered";
    default:
      return true;
  }
}

/** Order number, product name or the name printed on the shirt. */
function matchesQuery(order: Order, query: string): boolean {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  if (order.orderNumber?.toLowerCase().includes(needle)) return true;
  return (order.items ?? []).some(
    (item) =>
      item.name?.toLowerCase().includes(needle) ||
      item.customName?.toLowerCase().includes(needle),
  );
}

export default function OrderHistory() {
  const { user } = useAuth();
  const { addItem, openCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<OrderTab>("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  /** Which line the exchange modal is open for, plus its submit state. */
  const [exchangeTarget, setExchangeTarget] = useState<ExchangeTarget | null>(
    null,
  );
  const [submittingExchange, setSubmittingExchange] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    const params = new URLSearchParams({
      "where[customer][equals]": String(user.id),
      sort: "-originalCreatedAt",
      depth: "0",
      limit: "50",
    });

    fetch(`/api/orders?${params.toString()}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : { docs: [] }))
      .then((data: { docs?: Order[] }) => {
        setOrders(data.docs ?? []);
        setLoaded(true);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoaded(true);
      });

    return () => controller.abort();
  }, [user]);

  const reviewableCount = useMemo(
    () => orders.filter((order) => matchesTab(order, "review")).length,
    [orders],
  );

  const visible = useMemo(
    () =>
      orders.filter(
        (order) => matchesTab(order, tab) && matchesQuery(order, query),
      ),
    [orders, tab, query],
  );

  /** Puts every line of an order back in the cart at today's saved price. */
  const buyAgain = (order: Order) => {
    for (const item of order.items ?? []) {
      addItem({
        // The cart keys lines by id + size + custom name, so this has to be the
        // product — keying on the order number would fold a multi-item order
        // into a single line. Older rows without a product reference fall back
        // to the item name, which is still unique within an order.
        id: String(item.product ?? item.name),
        name: item.name,
        image: item.image ?? "",
        size: item.size ?? "",
        quantity: item.quantity,
        price: item.price,
        mrp: item.mrp ?? item.price,
        customName: item.customName,
      });
    }
    openCart();
  };

  /**
   * Raises the exchange, then swaps the updated order into the list so the
   * pending strip appears straight away — cheaper and steadier than refetching
   * the whole page of orders, and the endpoint hands back the saved document.
   */
  const submitExchange = async (reason: ExchangeReason) => {
    if (!exchangeTarget) return;
    setSubmittingExchange(true);
    setExchangeError(null);

    try {
      const res = await fetch(
        `/api/orders/${exchangeTarget.orderId}/exchange`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason,
            itemIndex: exchangeTarget.itemIndex,
          }),
        },
      );
      const data = (await res.json().catch(() => null)) as {
        order?: Order;
        errors?: { message?: string }[];
      } | null;

      if (!res.ok || !data?.order) {
        setExchangeError(
          data?.errors?.[0]?.message ??
            "We couldn't raise that exchange. Please try again.",
        );
        return;
      }

      const saved = data.order;
      setOrders((current) =>
        current.map((order) => (order.id === saved.id ? saved : order)),
      );
      setExchangeTarget(null);
    } catch {
      setExchangeError("We couldn't reach the server. Please try again.");
    } finally {
      setSubmittingExchange(false);
    }
  };

  const openExchange = (target: ExchangeTarget) => {
    setExchangeError(null);
    setExchangeTarget(target);
  };

  if (!user) return null;

  return (
    <div className="w-full">
      {/* `scrollbar-hide` keeps the horizontal strip clean, and `overflow-y-hidden`
          is load-bearing: setting only `overflow-x` makes the y axis compute to
          `auto`, so the -1px tab offset below was enough to raise a vertical
          scrollbar — a pair of stepper arrows on Windows. */}
      <nav className="scrollbar-hide flex gap-1 overflow-x-auto overflow-y-hidden border-b border-[#ECECEC]">
        {TABS.map(({ id, label }) => {
          const isActive = id === tab;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={isActive ? "page" : undefined}
              className={`-mb-px shrink-0 cursor-pointer border-b-2 px-10 pb-3 text-[15px] font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "border-[#F26522] text-[#F26522]"
                  : "border-transparent text-[#333] hover:text-[#F26522]"
              }`}
            >
              {label}
              {/* Only "To Review" carries a figure in the design, and it's the
                  one tab whose count we can actually derive. */}
              {id === "review" && reviewableCount > 0 && ` (${reviewableCount})`}
            </button>
          );
        })}
      </nav>

      <div className="relative border-b border-[#ECECEC]">
        <IconSearch
          size={18}
          stroke={1.8}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#8a8a8a]"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by order ID, product name or custom name"
          aria-label="Search orders"
          className="h-14 w-full bg-transparent pr-4 pl-10 text-[15px] outline-none placeholder:text-[#9a9a9a]"
        />
      </div>

      {!loaded ? (
        <p className="py-16 text-center text-gray-500">Loading orders…</p>
      ) : visible.length === 0 ? (
        <EmptyState hasOrders={orders.length > 0} tab={tab} query={query} />
      ) : (
        <div className="mt-5 flex flex-col gap-5">
          {visible.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isExpanded={expanded === String(order.id)}
              onToggleDetails={() =>
                setExpanded((current) =>
                  current === String(order.id) ? null : String(order.id),
                )
              }
              onBuyAgain={() => buyAgain(order)}
              onRequestExchange={(itemIndex, itemName) =>
                openExchange({ orderId: order.id, itemIndex, itemName })
              }
            />
          ))}
        </div>
      )}

      {exchangeTarget && (
        <RequestExchangeModal
          itemName={exchangeTarget.itemName}
          submitting={submittingExchange}
          error={exchangeError}
          onSubmit={submitExchange}
          onClose={() => setExchangeTarget(null)}
        />
      )}
    </div>
  );
}

function EmptyState({
  hasOrders,
  tab,
  query,
}: {
  hasOrders: boolean;
  tab: OrderTab;
  query: string;
}) {
  if (query) {
    return (
      <p className="py-16 text-center text-gray-500">
        No orders match “{query}”.
      </p>
    );
  }

  if (hasOrders) {
    return (
      <p className="py-16 text-center text-gray-500">
        {tab === "return"
          ? "You have no returns or exchanges."
          : "Nothing here right now."}
      </p>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-[#ECECEC] bg-white p-10 text-center">
      <p className="text-gray-500">You have no orders yet.</p>
      <Link
        href="/all/"
        className="mt-4 inline-block rounded-full bg-[#F26522] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Start shopping
      </Link>
    </div>
  );
}

function OrderCard({
  order,
  isExpanded,
  onToggleDetails,
  onBuyAgain,
  onRequestExchange,
}: {
  order: Order;
  isExpanded: boolean;
  onToggleDetails: () => void;
  onBuyAgain: () => void;
  onRequestExchange: (itemIndex: number, itemName: string) => void;
}) {
  const status = orderStatus(order.status);
  const items = order.items ?? [];
  const exchange = exchangeOf(order);
  // You can only send back something you've received, and an order carries one
  // exchange at a time — once raised, the strip below replaces the button.
  const canRequestExchange = order.status === "delivered" && !exchange;

  return (
    <article className="overflow-hidden rounded-xl border border-[#ECECEC] bg-white">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-[#F1F1F1] px-4 py-3">
        <div className="flex items-center gap-2 text-[15px]">
          <IconTruckDelivery
            size={19}
            stroke={1.7}
            aria-hidden="true"
            className="shrink-0 text-[#333]"
          />
          <span className="font-semibold text-[#111]">
            Order #{order.orderNumber}
          </span>
          <span aria-hidden="true" className="text-[#DDD]">
            |
          </span>
          <span className="text-[#7a7a7a]">
            Placed on {formatOrderDate(order.originalCreatedAt)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </span>
          {order.deliveredAt && (
            <span className="text-[13px] text-[#7a7a7a]">
              Delivered on {formatOrderDate(order.deliveredAt)}
            </span>
          )}
        </div>
      </header>

      <div className="divide-y divide-[#F1F1F1]">
        {items.map((item, index) => (
          <OrderItemRow
            key={`${order.id}-${index}`}
            item={item}
            // You can only review something you've actually received, so the
            // button appears once the order is delivered. This is also what
            // keeps the "To Review" tab honest — it lists exactly the orders
            // that have the button.
            canReview={order.status === "delivered"}
            onBuyAgain={onBuyAgain}
            onToggleDetails={onToggleDetails}
            onRequestExchange={
              canRequestExchange
                ? () => onRequestExchange(index, item.name)
                : undefined
            }
            isExpanded={isExpanded}
          />
        ))}
      </div>

      {isExpanded && <OrderDetails order={order} />}

      {exchange && <ExchangeStrip exchange={exchange} />}
    </article>
  );
}

function OrderItemRow({
  item,
  canReview,
  isExpanded,
  onBuyAgain,
  onToggleDetails,
  onRequestExchange,
}: {
  item: OrderItem;
  canReview: boolean;
  isExpanded: boolean;
  onBuyAgain: () => void;
  onToggleDetails: () => void;
  /** Omitted when this order can't be exchanged, which hides the button. */
  onRequestExchange?: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
      {/* Not `overflow-hidden`: the exchange button below deliberately hangs off
          the bottom edge, so the image is clipped by its own rounding instead. */}
      <div className="relative h-[74px] w-20 shrink-0">
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#F4F4F4]">
          {item.image && (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          )}
        </div>
        {onRequestExchange && (
          <button
            type="button"
            onClick={onRequestExchange}
            // Every line's button reads "Exchange", so the name does the work
            // of telling them apart on a multi-item order.
            aria-label={`Request an exchange for ${item.name}`}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 cursor-pointer rounded-md border border-[#E4E4E4] bg-white px-2 py-1 text-[11px] leading-tight font-semibold whitespace-nowrap text-[#333] shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-colors hover:border-[#F26522] hover:text-[#F26522]"
          >
            Exchange
          </button>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-[#111]">{item.name}</p>

        <p className="mt-1.5 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-[#7a7a7a]">
          {item.customName && <span>Custom Name: {item.customName}</span>}
          {item.size && <span>Size: {item.size}</span>}
        </p>

        {(item.color || item.material) && (
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-[#7a7a7a]">
            {item.color && <span>Color: {item.color}</span>}
            {item.color && item.material && (
              <span aria-hidden="true" className="text-[#CFCFCF]">
                •
              </span>
            )}
            {item.material && <span>Material: {item.material}</span>}
          </p>
        )}
      </div>

      <div className="shrink-0 lg:w-38.75 lg:border-l lg:border-[#F1F1F1] lg:pl-7">
        <p className="text-[15px] font-semibold text-[#111]">
          Rs. {item.price}
        </p>
        <p className="mt-1 text-[13px] text-[#7a7a7a]">Qty: {item.quantity}</p>
      </div>

      <div className="flex flex-wrap gap-2.5 lg:shrink-0">
        <button
          type="button"
          onClick={onToggleDetails}
          aria-expanded={isExpanded}
          className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-[#D9D9D9] px-3.5 text-[13px] font-semibold text-[#333] transition-colors hover:border-[#B4B4B4]"
        >
          <IconEye size={16} stroke={1.8} aria-hidden="true" />
          View Details
        </button>

        <button
          type="button"
          onClick={onBuyAgain}
          className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-[#F26522] px-3.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <IconRefresh size={16} stroke={1.9} aria-hidden="true" />
          Buy Again
        </button>

        {canReview && (
          <Link
            href="/reviews#leave-a-review"
            className="flex h-9 items-center gap-1.5 rounded-md border border-[#F26522] px-3.5 text-[13px] font-semibold text-[#F26522] transition-colors hover:bg-[#FFF4EF]"
          >
            <IconStar size={16} stroke={1.8} aria-hidden="true" />
            Write a Review
          </Link>
        )}
      </div>
    </div>
  );
}

/** Everything else the order already carries, revealed by "View Details".
 *  Built from real fields so the button does something rather than nothing. */
function OrderDetails({ order }: { order: Order }) {
  const shipping = [order.address, order.city, order.state, order.pincode]
    .filter(Boolean)
    .join(", ");
  // The strip is order-wide but an exchange is raised against specific lines,
  // so this is the one place that says which. Named rather than flagged on the
  // thumbnail, because the thumbnail badge is the request button.
  const exchanged = (order.items ?? [])
    .filter((item) => item.exchanged)
    .map((item) => item.name);

  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-3 border-t border-[#F1F1F1] bg-[#FAFAFA] px-4 py-4 text-[13px] sm:grid-cols-2">
      {shipping && (
        <div className="sm:col-span-2">
          <dt className="text-[#7a7a7a]">Delivery address</dt>
          <dd className="mt-0.5 font-medium text-[#111]">
            {order.fullName ? `${order.fullName} — ` : ""}
            {shipping}
          </dd>
        </div>
      )}
      {order.payment?.method && (
        <div>
          <dt className="text-[#7a7a7a]">Payment</dt>
          <dd className="mt-0.5 font-medium text-[#111] uppercase">
            {order.payment.method}
            {order.payment.status ? ` · ${order.payment.status}` : ""}
          </dd>
        </div>
      )}
      {typeof order.totalPrice === "number" && (
        <div>
          <dt className="text-[#7a7a7a]">Order total</dt>
          <dd className="mt-0.5 font-medium text-[#111]">
            Rs. {order.totalPrice}
            {typeof order.totalCount === "number"
              ? ` · ${order.totalCount} item${order.totalCount === 1 ? "" : "s"}`
              : ""}
          </dd>
        </div>
      )}
      {exchanged.length > 0 && (
        <div className="sm:col-span-2">
          <dt className="text-[#7a7a7a]">Exchange raised for</dt>
          <dd className="mt-0.5 font-medium text-[#111]">
            {exchanged.join(", ")}
          </dd>
        </div>
      )}
    </dl>
  );
}

/** Green once an exchange is accepted, blue while it's still pending. */
function ExchangeStrip({ exchange }: { exchange: OrderExchange }) {
  const accepted = exchange.state === "accepted";

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-[13px] ${
        accepted ? "bg-[#F1FAF4]" : "bg-[#F1F6FD]"
      }`}
    >
      <span
        className={`flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg ${
          accepted ? "bg-[#D8F0E2] text-[#1B8A4B]" : "bg-[#DCE9FA] text-[#2C6FCB]"
        }`}
      >
        <IconRefresh size={14} stroke={2} aria-hidden="true" />
      </span>

      <span
        className={`font-semibold ${accepted ? "text-[#1B8A4B]" : "text-[#2C6FCB]"}`}
      >
        {accepted ? "Exchange Accepted" : "Exchange Requested (Pending)"}
      </span>

      {exchange.reason && (
        <>
          <span aria-hidden="true" className="text-[#D5D5D5]">
            |
          </span>
          <span className="text-[#7a7a7a]">Reason: {exchange.reason}</span>
        </>
      )}

      {exchange.reference && (
        <>
          <span aria-hidden="true" className="text-[#D5D5D5]">
            |
          </span>
          <span className="text-[#7a7a7a]">
            Exchange ID: {exchange.reference}
          </span>
        </>
      )}
    </div>
  );
}

function orderStatus(status?: string) {
  switch (status) {
    case "delivered":
      return {
        label: "Completed",
        className: "bg-[#E6F6EC] text-[#1B8A4B]",
      };
    case "cancelled":
      return { label: "Cancelled", className: "bg-[#FDECEC] text-[#C0392B]" };
    case "shipped":
      return { label: "In progress", className: "bg-[#EAF2FD] text-[#2C6FCB]" };
    case "confirmed":
      return { label: "Confirmed", className: "bg-[#FFF1E8] text-[#F26522]" };
    default:
      return { label: "In progress", className: "bg-[#EAF2FD] text-[#2C6FCB]" };
  }
}

function formatOrderDate(value?: string) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}
