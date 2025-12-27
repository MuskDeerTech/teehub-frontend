"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/types/Product";

interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  quantity: number;
  image?: string;
  variation?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, variation?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateSize: (slug: string, newSize: string) => void;
  cartCount: number;
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  wishlistCount: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  updateSize: () => {},
  cartCount: 0,
  wishlist: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  wishlistCount: 0,
  clearCart: () => {},
});

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // ✅ Load from localStorage on first render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      const savedWishlist = localStorage.getItem("wishlist");
      if (savedCart) setCartItems(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  // ✅ Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // ✅ Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist]);

  // ✅ Add to Cart
  const addToCart = (
    product: Product,
    quantity: number = 1,
    variation?: string
  ) => {
    if (!product || !product.slug) {
      console.error("Invalid product provided to addToCart:", product);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.slug === product.slug && item.variation === variation
      );

      if (existing) {
        return prev.map((item) =>
          item.slug === product.slug && item.variation === variation
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.salePrice || product.regularPrice || 0,
          regularPrice: product.regularPrice || product.salePrice || 0,
          salePrice: product.salePrice ?? undefined,
          quantity,
          image: product.images?.[0]?.image?.url,
          variation,
        },
      ];
    });
  };

  // ✅ Remove item
  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.slug !== productId));
  };

  // ✅ Update quantity
  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.slug === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  // ✅ Update size / variation
  const updateSize = (slug: string, newSize: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.slug === slug ? { ...item, variation: newSize } : item
      )
    );
  };

  // ✅ Wishlist handlers
  const addToWishlist = (product: Product) => {
    if (!product.slug) return;
    setWishlist((prev) =>
      prev.some((item) => item.slug === product.slug)
        ? prev
        : [...prev, product]
    );
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.slug !== productId));
  };

  // ✅ Clear cart
  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart");
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartCount,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        wishlistCount,
        updateSize,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
