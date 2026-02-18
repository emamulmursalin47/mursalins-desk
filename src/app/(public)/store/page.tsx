import type { Metadata } from "next";
import { getProducts } from "@/lib/api";
import { ProductsHero } from "@/components/products/products-hero";
import { ProductsGrid } from "@/components/products/products-grid";

export const metadata: Metadata = {
  title: "Store",
  description:
    "Browse ready-made digital products — templates, components, and tools built with modern technology and production-ready quality.",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function StorePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  const result = await getProducts(currentPage, 12).catch(() => null);

  return (
    <>
      <ProductsHero />
      <ProductsGrid
        products={result?.data ?? []}
        meta={result?.meta ?? null}
      />
    </>
  );
}
