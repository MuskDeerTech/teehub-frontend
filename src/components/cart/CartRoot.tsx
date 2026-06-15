"use client";

import { useEffect, useState } from "react";
import { cartFlow, CartState } from "@/lib/CartFlow";
import CartDetails from "./CartDetails";
import CartLogin from "./CartLogin";

export default function CartRoot() {
  const [state, setState] = useState<CartState>({
    step: "closed",
    product: null,
    quantity: 1,
    size: null,
  });

  useEffect(() => {
  console.log("CartRoot mounted");

  return cartFlow.subscribe((s) => {
    console.log("CartRoot received:", s);
    setState(s);
  });
}, []);

  if (state.step === "closed") return null;

  return (
    <>
      {state.step === "details" && (
        <CartDetails
          item={{
            id: state.product?.slug ?? "",
            name: state.product?.title ?? "",
            image: state.product?.image ?? "",
            size: state.size ?? "",
            quantity: state.quantity ?? 1,
            price: state.product?.price ?? 0,
            mrp: state.product?.originalPrice ?? 0,
          }}
          onClose={() => cartFlow.close()}
          onProceed={() => cartFlow.goToLogin()}
        />
      )}

      {state.step === "login" && (
        <CartLogin open={true} onClose={() =>cartFlow.close()} />
      )}
    </>
  );
}
