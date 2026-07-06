import type { MetadataRoute } from "next";
import { getAllProducts, getCategories } from "@/lib/catalog";
import { getAllPages } from "@/lib/pages";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, pages] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getAllPages(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/category/all"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/new-in"), changeFrequency: "daily", priority: 0.8 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: absoluteUrl(`/category/${c.slug}`),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: absoluteUrl(`/product/${p.slug}`),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const pageRoutes: MetadataRoute.Sitemap = pages.map((pg) => ({
    url: absoluteUrl(`/policies/${pg.slug}`),
    changeFrequency: "monthly",
    priority: 0.3,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...pageRoutes];
}
