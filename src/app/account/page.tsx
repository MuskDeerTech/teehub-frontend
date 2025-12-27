"use client";
import { useAuth } from "@/hooks/useAuth";

export default function AccountHome() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center py-10">Checking login...</p>;
  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Welcome to your account dashboard!</h1>
      <p>Phone: {user.phoneNumber}</p>
    </div>
  );
}
