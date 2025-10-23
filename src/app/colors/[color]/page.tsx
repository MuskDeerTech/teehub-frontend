"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/Product";

export default function ColorProductsPage() {
  const { color } = useParams();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=100`
        );
        const data = await res.json() as { docs: Product[] };

        const filtered = data.docs.filter((p) =>
          p.attributes?.some(
            (a) =>
              a.attribute.name.toLowerCase() === "colors" &&
              a.values.some(
                (v) =>
                  v.value.toLowerCase() === decodeURIComponent(color as string)
              )
          )
        );

        setProducts(filtered);
      } catch (err) {
        console.error("Failed to fetch color products:", err);
      }
    };
    fetchProducts();
  }, [color]);

  return (
    <div className="px-6 py-12">
      <h1 className="text-3xl font-bold mb-6 capitalize">
        {decodeURIComponent(color as string)} Collection
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <p className="col-span-full text-gray-500 text-center">
            No products found in this color.
          </p>
        )}
      </div>
    </div>
  );
}