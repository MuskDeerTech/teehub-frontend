"use client";

import type { Product } from "@/lib/products";

export type CartStep = "closed" | "details" | "login";

export interface CartState {
  step: CartStep;
  product: Product | null;
  quantity: number;
  size: string | null;
}

type Listener = (state: CartState) => void;

class CartFlow {
  private listeners: Listener[] = [];

  private state: CartState = {
    step: "closed",
    product: null,
    quantity: 1,
    size: null,
  };

  // Subscribe to cart state changes
subscribe(fn: Listener) {
  this.listeners.push(fn);

  // safe async push
  queueMicrotask(() => fn(this.state));

  return () => {
    this.listeners = this.listeners.filter((l) => l !== fn);
  };
}

  // Notify all subscribers
  private emit() {
    this.listeners.forEach((fn) => fn(this.state));
  }

  // OPEN CART DETAILS (first modal)
 open(product: Product, size: string, quantity: number) {
  console.log("OPEN CALLED", {
    title: product?.title,
    size,
    quantity,
  });

  this.state = {
    step: "details",
    product,
    size,
    quantity,
  };

  this.emit();
}

  // MOVE TO LOGIN STEP
  goToLogin() {
    this.state = {
      ...this.state,
      step: "login",
    };

    this.emit();
  }

  // CLOSE ENTIRE FLOW
  close() {
    this.state = {
      step: "closed",
      product: null,
      size: null,
      quantity: 1,
    };

    this.emit();
  }
}

// singleton instance 
export const cartFlow = new CartFlow();