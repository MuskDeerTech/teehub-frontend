"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const menu = [
    { name: "My Orders", href: "/account/orders" },
    { name: "Saved Addresses", href: "/account/addresses" },
  ];

  const handleLogout = () => {
    // Remove stored user info
    localStorage.removeItem("user");
    // Optionally clear cart or other local data
    // localStorage.removeItem("cart");
    // Redirect to home or login page
    router.push("/login");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 flex gap-8 ">
      <aside className="w-64 border-r">
        <h2 className="font-bold mb-4">My Account</h2>
        <nav className="flex flex-col gap-2">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === item.href
                  ? "bg-orange-100 text-orange-600"
                  : "hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="mt-6 w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}
