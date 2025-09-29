import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: any[] }) {
  if (!products.length) {
    return <p>No products found.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
