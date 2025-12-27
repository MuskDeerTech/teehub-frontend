"use client";
import { useAuth } from "@/hooks/useAuth";
import Wishlist from "@/components/Wishlist";

export default function WishlistPage() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center py-10">Checking login...</p>;
  if (!user) return null;

  return <Wishlist />;
}
