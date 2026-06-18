"use client";

import { useCart } from "./CartContext";
import CartDetails from "./CartDetails";
import CartLogin from "./CartLogin";
import CartRegister from "./CartRegister";
import CartPayment from "./CartPayment";

export default function CartRoot() {
  const {
    activeItem,
    cartOpen,
    step,
    customer,
    phone,
    totalCount,
    totalMrp,
    totalPrice,
    closeCart,
    goToStep,
    updateItem,
    setPhone,
    setCustomer,
  } = useCart();

  if (step === "details") {
    return (
      <CartDetails
        open={cartOpen}
        item={activeItem}
        totalCount={totalCount}
        totalMrp={totalMrp}
        totalPrice={totalPrice}
        onUpdate={updateItem}
        onClose={closeCart}
        onProceed={() => goToStep("login")}
      />
    );
  }

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
          goToStep("register");
        }}
      />
    );
  }

  if (step === "register") {
    return (
      <CartRegister
        open={cartOpen}
        totalCount={totalCount}
        totalMrp={totalMrp}
        totalPrice={totalPrice}
        phone={phone}
        customer={customer}
        onClose={closeCart}
        onBack={() => goToStep("login")}
        onSuccess={(nextCustomer) => {
          setCustomer(nextCustomer);
          goToStep("payment");
        }}
      />
    );
  }

  return (
    <CartPayment
      open={cartOpen}
      totalCount={totalCount}
      totalMrp={totalMrp}
      totalPrice={totalPrice}
      customer={customer}
      onClose={closeCart}
      onBack={() => goToStep("register")}
      onSuccess={closeCart}
    />
  );
}
