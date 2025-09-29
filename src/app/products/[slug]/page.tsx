// src/app/products/[slug]/page.tsx

import Image from "next/image"
import { notFound } from "next/navigation"

interface Product {
  id: string
  name: string
  slug: string
  description?: any
  regularPrice?: number
  salePrice?: number
  mrp?: number
  images?: { image: { url: string; alt?: string } }[]
  categories?: { name: string; id: string }[]
  brand?: string
  stockStatus?: string
  attributes?: {
    attribute: { name: string; id: string }
    selectedValues?: { value: string; id: string }[]
  }[]
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined")

    const res = await fetch(
      `${baseUrl}/products?where[slug][equals]=${slug}`,
      { cache: "no-store" }
    )

    if (!res.ok) return null
    const data = await res.json()
    return data?.docs?.[0] || null
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) return notFound()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          {product.images?.map((img, idx) => (
            <div key={idx} className="relative w-full h-[400px] border rounded-lg overflow-hidden">
              <Image
                src={img.image.url}
                alt={img.image.alt || product.name}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-xl font-semibold mb-2">₹{product.regularPrice}</p>
          <p className="mb-4">
            <span className="font-semibold">Availability:</span> {product.stockStatus}
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
