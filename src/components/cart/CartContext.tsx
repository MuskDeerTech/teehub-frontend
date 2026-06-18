"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartStep = "details" | "login" | "register" | "payment";

export interface CartItem {
  lineId: string;
  id: string;
  name: string;
  image: string;
  size: string;
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
  phone: string;
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
  setPhone: (phone: string) => void;
  setCustomer: (customer: CustomerData) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const lineIdFor = (item: NewCartItem) =>
  `${item.id}:${item.size}:${item.customName ?? ""}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [step, setStep] = useState<CartStep>("details");
  const [phone, setPhoneState] = useState("");
  const [customer, setCustomerState] = useState<CustomerData | null>(null);

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
    setPhoneState("");
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

  const setPhone = useCallback((nextPhone: string) => {
    setPhoneState(nextPhone);
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
      phone,
      ...totals,
      addItem,
      removeItem,
      updateItem,
      clearCart,
      openCart,
      closeCart,
      goToStep,
      setPhone,
      setCustomer,
    }),
    [
      items,
      cartOpen,
      step,
      customer,
      phone,
      totals,
      addItem,
      removeItem,
      updateItem,
      clearCart,
      openCart,
      closeCart,
      goToStep,
      setPhone,
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
