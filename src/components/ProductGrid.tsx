import ProductCard from "./ProductCard";
import { Product } from "@/types/Product";

interface Props {
  products: Product[];
}

export default function ProductGrid({ products }: Props) {
  if (!products.length) {
    return <p className="text-center text-gray-500">No products found.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}