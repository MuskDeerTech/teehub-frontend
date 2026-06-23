"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import CartDetails from "./CartDetails";
import CartLogin from "./CartLogin";

export default function CartRoot() {
  const router = useRouter();
  const {
    items,
    cartOpen,
    step,
    phone,
    totalCount,
    totalMrp,
    totalPrice,
    closeCart,
    goToStep,
    updateItem,
    removeItem,
    setPhone,
  } = useCart();

  // register/payment now live on their own pages (/checkout/address,
  // /checkout/payment) — the drawer no longer renders them.
  if (step === "login") {
    return (
      <CartLogin
        open={cartOpen}
        totalCount={totalCount}
        totalMrp={totalMrp}
        totalPrice={totalPrice}
        initialPhone={phone}
        onClose={closeCart}
        onBack={() => goToStep("details")}
        onSuccess={(mobile) => {
          setPhone(mobile);
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
      onProceed={() => goToStep("login")}
    />
  );
}