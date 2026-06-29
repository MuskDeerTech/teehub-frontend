"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { IconMapPin, IconUserCircle } from "@tabler/icons-react";
import { useAuth } from "@/components/auth/AuthContext";

type OrderItem = {
  name: string;
  image?: string;
  size?: string;
  quantity: number;
  price: number;
  mrp?: number;
  customName?: string;
};
type Order = {
  id: string | number;
  orderNumber: string;
  status?: string;
  originalCreatedAt?: string;
  totalPrice?: number;
  items?: OrderItem[];
};

export default function AccountPage() {
  return (
    <Suspense
      fallback={<p className="px-6 py-20 text-center text-gray-500">Loading…</p>}
    >
      <AccountView />
    </Suspense>
  );
}

function AccountView() {
  const router = useRouter();
  const params = useSearchParams();
  const isWelcome = params.get("welcome") === "1";
  const { user, loading, updateProfile, logout } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [flat, setFlat] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [label, setLabel] = useState<"Home" | "Work">("Home");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);

  // Prefill from the loaded customer + their default (or first) address.
  useEffect(() => {
    if (!user) return;
    const primary =
      user.addresses?.find((a) => a.isDefault) ?? user.addresses?.[0];
    setFullName(user.fullName ?? "");
    setPhone(user.phone ?? "");
    setFlat(primary?.address ?? "");
    setCity(primary?.city ?? "");
    setState(primary?.state ?? "");
    setPincode(primary?.pincode ?? "");
    if (primary?.label === "Work") setLabel("Work");
  }, [user]);

  // Load this customer's order history (own orders only, by access control).
  useEffect(() => {
    if (!user) return;
    const query = new URLSearchParams({
      "where[customer][equals]": String(user.id),
      sort: "-originalCreatedAt",
      depth: "0",
      limit: "20",
    });
    fetch(`/api/orders?${query.toString()}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { docs: [] }))
      .then((data: { docs?: Order[] }) => setOrders(data.docs ?? []))
      .catch(() => {});
  }, [user]);

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

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(false);
    setSaving(true);
    setError("");
    const fullAddress = [flat.trim(), area.trim()].filter(Boolean).join(", ");
    try {
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        addresses: fullAddress
          ? [
              {
                label,
                fullName: fullName.trim(),
                phone: phone.trim(),
                address: fullAddress,
                city: city.trim(),
                state: state.trim(),
                pincode: pincode.trim(),
                isDefault: true,
              },
            ]
          : [],
      });
      setSaved(true);
      if (isWelcome) router.replace("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full px-[clamp(16px,4vw,80px)] py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isWelcome ? "Welcome to TeeHub!" : "My Account"}
          </h1>
          {isWelcome && (
            <p className="mt-1 text-sm text-gray-500">
              Add your details to speed up checkout.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          className="text-sm font-medium text-gray-500 hover:text-[#F26522]"
        >
          Log out
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* LEFT: details form */}
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-[#ECECEC] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
        >
          {saved && (
            <div className="mb-4 rounded-lg bg-green-100 py-2 text-center text-sm font-medium text-green-700">
              Saved successfully
            </div>
          )}

          <SectionTitle icon={<IconMapPin size={20} />}>
            Add Delivery Address
          </SectionTitle>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Input label="Pincode" value={pincode} onChange={setPincode} inputMode="numeric" />
            <Input label="City" value={city} onChange={setCity} />
            <Input label="State" value={state} onChange={setState} />
          </div>
          <div className="mt-3 flex flex-col gap-3">
            <Input label="Flat / House Number" value={flat} onChange={setFlat} />
            <Input
              label="Apartment, Area, Sector, Village"
              value={area}
              onChange={setArea}
            />
          </div>

          <div className="mt-7">
            <SectionTitle icon={<IconUserCircle size={20} />}>
              Customer Information
            </SectionTitle>
            <div className="mt-4 flex flex-col gap-3">
              <Input label="Full Name*" value={fullName} onChange={setFullName} />
              <Input label="Phone Number*" value={phone} onChange={setPhone} inputMode="numeric" />
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-gray-500">Email Address*</span>
                <input
                  type="email"
                  value={user.email ?? ""}
                  readOnly
                  className="h-11 cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 text-gray-500"
                />
              </label>
            </div>
          </div>

          {/* Save address as */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium">Save Address As</p>
            <div className="flex gap-3">
              {(["Home", "Work"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLabel(option)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition ${
                    label === option
                      ? "border-[#F26522] text-[#F26522]"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 h-12 w-full rounded-[10px] bg-[#F26522] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Continue"}
          </button>
          <p className="mt-3 text-center text-[11px] text-gray-400">
            By proceeding, I agree to TeeHub&apos;s Privacy Policy and T&amp;C
          </p>
        </form>

        {/* RIGHT: order history */}
        <div>
          <h2 className="mb-4 text-lg font-bold">
            Order History [{orders.length}]
          </h2>
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-[#ECECEC] bg-white p-10 text-center text-gray-500 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              You have no orders yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const status = orderStatus(order.status);
  const items = order.items ?? [];

  return (
    <div className="rounded-2xl border border-[#ECECEC] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Ordered on
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {formatOrderDate(order.originalCreatedAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {typeof order.totalPrice === "number" && (
            <p className="text-sm font-bold text-[#F26522]">
              ₹{order.totalPrice}
            </p>
          )}
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <OrderItemRow key={`${order.id}-${index}`} item={item} />
        ))}
      </div>

      <p className="mt-4 text-right text-sm font-bold text-gray-900">
        Order ID: {order.orderNumber}
      </p>
    </div>
  );
}

function OrderItemRow({ item }: { item: OrderItem }) {
  const discount =
    item.mrp && item.mrp > item.price
      ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
      : 0;
  return (
    <div className="flex gap-4">
      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
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
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#F26522]">₹{item.price}</span>
          {item.mrp && item.mrp > item.price && (
            <>
              <span className="text-sm text-gray-400 line-through">
                ₹{item.mrp}
              </span>
              {discount > 0 && (
                <span className="text-xs font-medium text-green-600">
                  ({discount}% Off)
                </span>
              )}
            </>
          )}
        </div>
        <p className="mt-1 font-semibold leading-snug">{item.name}</p>
        {item.customName && (
          <p className="text-xs text-gray-500">
            Custom Details : {item.customName}
          </p>
        )}
        <div className="mt-2 flex gap-6 text-xs text-gray-600">
          <span>Qty: {item.quantity}</span>
          {item.size && <span>Size: {item.size}</span>}
        </div>
      </div>
    </div>
  );
}

function orderStatus(status?: string) {
  switch (status) {
    case "delivered":
      return {
        label: "Completed",
        className: "bg-green-50 text-green-700 ring-1 ring-green-100",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-red-50 text-red-700 ring-1 ring-red-100",
      };
    case "shipped":
      return {
        label: "In progress",
        className: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
      };
    case "confirmed":
      return {
        label: "Confirmed",
        className: "bg-orange-50 text-[#F26522] ring-1 ring-orange-100",
      };
    default:
      return {
        label: "In progress",
        className: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
      };
  }
}

function formatOrderDate(value?: string) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 font-semibold">
      {icon}
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "numeric" | "text";
}) {
  return (
    <label className="flex flex-1 flex-col gap-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <input
        type="text"
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-lg border border-gray-300 px-4 outline-none transition-colors focus:border-[#F26522]"
      />
    </label>
  );
}
