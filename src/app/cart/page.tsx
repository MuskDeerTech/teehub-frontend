"use client";
import { useAuth } from "@/hooks/useAuth";
import Cart from "@/components/Cart";

export default function CartPage() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center py-10">Checking login...</p>;
  if (!user) return null;
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <Cart />
    </main>
  );
}
