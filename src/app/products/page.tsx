import api from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";

async function getProducts() {
  try {
    const res = await api.get("/products", {
      params: {
        where: { status: { equals: "Published" } },
      },
    });
    return res.data.docs;
  } catch (err) {
    console.error("Error fetching products", err);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Products</h1>
      <ProductGrid products={products} />
    </main>
  );
}
