"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  const { cartItems, clearCart } = useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    phone: "",
  });

  const subtotal = cartItems.reduce(
    (total, item) => total + (item.regularPrice || 0) * item.quantity,
    0
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const orderData = {
    orderId: "ORD-" + Date.now(),
    total: subtotal - discount,
    status: "pending",
    products: cartItems.map((item) => ({
      product: item.id, // use actual product ID from Payload
      quantity: item.quantity,
    })),
    user: null, // optional if no login
  };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) throw new Error("Failed to create order");

    alert("✅ Order placed successfully!");
    clearCart();
  } catch (error) {
    console.error(error);
    alert("❌ Failed to place order. Please try again.");
  }
};


  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase();

    if (code === "SAVE10") {
      setDiscount(subtotal * 0.1); // 10% off
      setCouponMessage("✅ Coupon applied! You saved 10%");
    } else if (code === "FREESHIP") {
      setDiscount(0);
      setCouponMessage("🚚 Free shipping applied!");
    } else {
      setDiscount(0);
      setCouponMessage("❌ Invalid coupon code");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500">
          Your cart is empty.{" "}
          <Link href="/" className="text-orange-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 🧾 Left: Billing Details */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">Billing Details</h2>

            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />

            <textarea
              name="address"
              placeholder="Full Address"
              value={form.address}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 h-24"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                name="pincode"
                placeholder="Pincode"
                value={form.pincode}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />

            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Place Order
            </button>
          </form>

          {/* 🛒 Right: Order Summary */}
          <div className="border-[0.5px] border-[#C7CBD4] rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <ul className="divide-y">
              {cartItems.map((item) => (
                <li key={item.slug} className="py-3 flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>₹{(item.regularPrice || 0) * item.quantity}</span>
                </li>
              ))}
            </ul>

            {/* Coupon Code */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Have a Coupon?</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                >
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className="text-sm mt-2 text-gray-600">{couponMessage}</p>
              )}
            </div>

            <div className="flex justify-between mt-4 border-t pt-4 font-semibold">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="flex justify-between mt-2">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <div className="flex justify-between mt-4 border-t pt-4 font-semibold">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600 mt-2">
                <span>Discount</span>
                <span>- ₹{discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between mt-4 text-lg font-bold">
              <span>Total</span>
              <span>₹{(subtotal - discount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
