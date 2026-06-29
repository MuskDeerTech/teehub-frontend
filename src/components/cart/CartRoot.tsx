"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import { useCart } from "./CartContext";
import CartDetails from "./CartDetails";

export default function CartRoot() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    items,
    cartOpen,
    step,
    totalCount,
    totalMrp,
    totalPrice,
    closeCart,
    goToStep,
    updateItem,
    removeItem,
  } = useCart();

  // register/payment now live on their own pages (/checkout/address,
  // /checkout/payment) — the drawer no longer renders them.
  if (step === "login") {
    return (
      <AuthForm
        open={cartOpen}
        onClose={closeCart}
        onBack={() => goToStep("details")}
        onAuthenticated={() => {
          closeCart();
          router.push("/checkout/address");
        }}
      />
    );
  }

  return (
    <CartDetails
      open={cartOpen}
      items={items}
      totalCount={totalCount}
      totalMrp={totalMrp}
      totalPrice={totalPrice}
      onUpdate={updateItem}
      onRemove={removeItem}
      onClose={closeCart}
      onProceed={() => {
        if (authLoading) return;
        if (user) {
          closeCart();
          router.push("/checkout/address");
          return;
        }
        goToStep("login");
      }}
    />
  );
}
