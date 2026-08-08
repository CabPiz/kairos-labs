import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const produtos: MetadataRoute.Sitemap = getProducts().map((p) => ({
    url: `https://kairoslabs.com.br/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: "https://kairoslabs.com.br",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    ...produtos,
  ];
}
