"use client";

import type { Product } from "@/lib/products";

export type CartStep = "closed" | "details" | "login" | "register";

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

  subscribe(fn: Listener) {
    this.listeners.push(fn);
    fn(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private emit() {
    this.listeners.forEach((fn) => fn(this.state));
  }

  open(product: Product, size: string, quantity: number) {
    this.state = { step: "details", product, size, quantity };
    this.emit();
  }

  goToDetails() {
    this.state = { ...this.state, step: "details" };
    this.emit();
  }

  goToLogin() {
    this.state = { ...this.state, step: "login" };
    this.emit();
  }

  goToRegister() {
    this.state = { ...this.state, step: "register" };
    this.emit();
  }

  close() {
    this.state = { step: "closed", product: null, size: null, quantity: 1 };
    this.emit();
  }
}

export const cartFlow = new CartFlow();