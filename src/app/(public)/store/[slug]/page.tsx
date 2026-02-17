import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getProducts, getProductReviews } from "@/lib/api";
import type { Product, Review } from "@/types/api";
import { ProductDetailView } from "@/components/products/product-detail-view";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.name} | Store`,
    description:
      product.description || `View details about ${product.name}`,
    openGraph: {
      title: product.name,
      description: product.description || "",
      images: product.thumbnailUrl ? [{ url: product.thumbnailUrl }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  /* Fetch related products + reviews in parallel */
  let relatedProducts: Product[] = [];
  let reviews: Review[] = [];
  try {
    const [allProducts, reviewsResult] = await Promise.all([
      getProducts(1, 100),
      getProductReviews(product.id).catch(() => null),
    ]);
    relatedProducts = allProducts.data
      .filter((p) => p.id !== product.id && p.type === product.type)
      .slice(0, 3);
    reviews = reviewsResult?.data ?? [];
  } catch {
    /* silently ignore — non-critical data */
  }

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
      reviews={reviews}
    />
  );
}
