import type { Metadata } from "next";
import { getProducts } from "@/lib/api";
import { ProductsHero } from "@/components/products/products-hero";
import { ProductsGrid } from "@/components/products/products-grid";

export const metadata: Metadata = {
  title: "Store — Web Development Templates & Digital Products",
  description:
    "Browse ready-made digital products by a freelance full-stack developer — Next.js templates, React components, SaaS boilerplates, and production-ready tools for web development.",
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
