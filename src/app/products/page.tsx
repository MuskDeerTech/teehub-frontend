"use client";

import { Suspense } from "react";
import ProductsPageContent from "@/components/ProductsPageContent";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
