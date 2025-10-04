// src/app/page.tsx
"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from 'next/link'; // Ensure this is imported at top
import api from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";
import { Product } from "@/types/Product";

async function getFeaturedProducts(): Promise<Product[]> {
  const res = await api.get("/products?limit=8&sort=createdAt&order=-1&depth=2");
  return res.data?.docs || [];
}

async function getCategories(): Promise<{ label: string; value: string }[]> {
  const res = await api.get("/categories");
  return (
    res.data?.docs?.map((cat: { id: string; name: string }) => ({
      label: cat.name,
      value: cat.id,
    })) || []
  );
}

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-banner.jpg" // Replace with your hero image or use a dynamic one
            alt="Shop Tees & Apparel"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center text-white">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
            Teehub Shop
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
            Elevate your style with our exclusive collection of cricket jerseys, hoodies, and more. Shop now and save up to 50%!
          </p>
          <Link prefetch={true}
            href="/products"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-2xl"
          >
            Shop Collection
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((category) => (
              <Link prefetch={true}
                key={category.value}
                href={`/products?category=${category.value}`}
                className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  {/* Placeholder for category image */}
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {category.label.charAt(0)}
                  </div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-gray-900 mt-2">
                    {category.label}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
          {categories.length > 4 && (
            <div className="text-center mt-8">
              <Link 
                href="/products" prefetch={true}
                className="text-blue-600 hover:underline text-lg font-medium"
              >
                View All Categories →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link prefetch={true}
              href="/products" 
              className="text-blue-600 hover:underline font-medium"
            >
              View All →
            </Link>
          </div>
          <Suspense fallback={<div className="text-center py-12">Loading featured products...</div>}>
            <ProductGrid products={featuredProducts} />
          </Suspense>
        </div>
      </section>

      {/* Sale/Promo Section */}
      {/* <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Flash Sale: Up to 50% Off!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Limited time offer on select jerseys and hoodies. Don't miss out!
          </p>
          <Link prefetch={true}
            href="/products"
            className="inline-block bg-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-red-700 transition transform hover:scale-105 shadow-lg"
          >
            Shop Sale
          </Link>
        </div>
      </section> */}

      {/* Newsletter Signup */}
      {/* <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated with Exclusive Deals
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Subscribe to our newsletter and get 10% off your first order.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button className="px-8 py-4 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition">
              Subscribe
            </button>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      {/* <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">TeeHub</h3>
              <p className="text-gray-400">
                Your one-stop shop for premium tees and apparel.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                {categories.slice(0, 4).map((cat) => (
                  <li key={cat.value}>
                    <Link prefetch={true} href={`/products?category=${cat.value}`} className="hover:text-white">
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Customer Care</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/returns" className="hover:text-white">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TeeHub. All rights reserved.</p>
          </div>
        </div>
      </footer> */}
    </div>
  );
}