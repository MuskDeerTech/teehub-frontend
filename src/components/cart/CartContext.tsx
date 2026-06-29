"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/auth/AuthContext";

export type CartStep = "details" | "login" | "register" | "payment";

export interface CartItem {
  lineId: string;
  id: string;
  name: string;
  image: string;
  size: string;
  availableSizes?: string[];
  quantity: number;
  price: number;
  mrp: number;
  customName?: string;
}

export type NewCartItem = Omit<CartItem, "lineId">;

export interface CustomerData {
  fullName: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  phone: string;
  email: string;
}

interface CartContextValue {
  items: CartItem[];
  activeItem: CartItem | null;
  cartOpen: boolean;
  step: CartStep;
  customer: CustomerData | null;
  totalCount: number;
  totalMrp: number;
  totalPrice: number;
  addItem: (item: NewCartItem) => void;
  removeItem: (lineId: string) => void;
  updateItem: (lineId: string, changes: Partial<CartItem>) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  goToStep: (step: CartStep) => void;
  setCustomer: (customer: CustomerData) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "teehub-cart-items";

const lineIdFor = (item: NewCartItem) =>
  `${item.id}:${item.size}:${item.customName ?? ""}`;

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.lineId === "string" &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.image === "string" &&
    typeof item.size === "string" &&
    typeof item.quantity === "number" &&
    typeof item.price === "number" &&
    typeof item.mrp === "number"
  );
}

function normalizeCartItems(value: unknown) {
  return Array.isArray(value) ? value.filter(isCartItem) : [];
}

function mergeCartItems(accountItems: CartItem[], localItems: CartItem[]) {
  const merged = new Map<string, CartItem>();
  for (const item of [...accountItems, ...localItems]) {
    const existing = merged.get(item.lineId);
    if (!existing) {
      merged.set(item.lineId, item);
      continue;
    }
    merged.set(item.lineId, {
      ...existing,
      ...item,
      quantity: Math.max(existing.quantity, item.quantity),
    });
  }
  return [...merged.values()];
}

function readStoredCartItems() {
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return normalizeCartItems(parsed);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : "";
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [accountCartReady, setAccountCartReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [step, setStep] = useState<CartStep>("details");
  const [customer, setCustomerState] = useState<CustomerData | null>(null);
  const mergedUserId = useRef("");

  useEffect(() => {
    setItems(readStoredCartItems());
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [cartLoaded, items]);

  useEffect(() => {
    if (!cartLoaded) return;

    if (!userId) {
      mergedUserId.current = "";
      setAccountCartReady(false);
      return;
    }

    if (mergedUserId.current === userId) return;

    const accountItems = normalizeCartItems(
      (user as { savedCart?: unknown } | null)?.savedCart,
    );
    setItems((current) => mergeCartItems(accountItems, current));
    mergedUserId.current = userId;
    setAccountCartReady(true);
  }, [cartLoaded, user, userId]);

  useEffect(() => {
    if (!cartLoaded || !accountCartReady || !userId) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      fetch(`/api/customers/${userId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedCart: items }),
        signal: controller.signal,
      }).catch(() => {});
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [accountCartReady, cartLoaded, items, userId]);

  const addItem = useCallback((item: NewCartItem) => {
    const lineId = lineIdFor(item);
    setItems((current) => {
      const existing = current.find((entry) => entry.lineId === lineId);
      if (!existing) return [...current, { ...item, lineId }];

      return current.map((entry) =>
        entry.lineId === lineId
          ? { ...entry, quantity: entry.quantity + item.quantity }
          : entry,
      );
    });
    setStep("details");
    setCartOpen(true);
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((current) => current.filter((item) => item.lineId !== lineId));
  }, []);

  const updateItem = useCallback(
    (lineId: string, changes: Partial<CartItem>) => {
      setItems((current) =>
        current.map((item) =>
          item.lineId === lineId ? { ...item, ...changes } : item,
        ),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setStep("details");
    setCustomerState(null);
  }, []);

  const openCart = useCallback(() => {
    setStep("details");
    setCartOpen(true);
  }, []);

  const closeCart = useCallback(() => setCartOpen(false), []);

  const goToStep = useCallback((nextStep: CartStep) => {
    setStep(nextStep);
    setCartOpen(true);
  }, []);

  const setCustomer = useCallback((nextCustomer: CustomerData) => {
    setCustomerState(nextCustomer);
  }, []);

  const totals = useMemo(
    () =>
      items.reduce(
        (sum, item) => ({
          totalCount: sum.totalCount + item.quantity,
          totalMrp: sum.totalMrp + item.mrp * item.quantity,
          totalPrice: sum.totalPrice + item.price * item.quantity,
        }),
        { totalCount: 0, totalMrp: 0, totalPrice: 0 },
      ),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      activeItem: items[0] ?? null,
      cartOpen,
      step,
      customer,
      ...totals,
      addItem,
      removeItem,
      updateItem,
      clearCart,
      openCart,
      closeCart,
      goToStep,
      setCustomer,
    }),
    [
      items,
      cartOpen,
      step,
      customer,
      totals,
      addItem,
      removeItem,
      updateItem,
      clearCart,
      openCart,
      closeCart,
      goToStep,
      setCustomer,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return context;
}
