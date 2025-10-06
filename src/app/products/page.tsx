"use client";

import { Suspense } from "react";
import ProductsPageContent from "@/components/ProductsPageContent";
import ProductGridSkeleton from "../page";

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductsPageContent />
    </Suspense>
  );
}
