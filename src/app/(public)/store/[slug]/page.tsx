import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getProducts, getProductReviews } from "@/lib/api";
import type { Product, Review } from "@/types/api";
import { ProductDetailView } from "@/components/products/product-detail-view";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const result = await getProducts(1, 100).catch(() => null);
  return (result?.data ?? []).map((p) => ({ slug: p.slug }));
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
      url: `${siteConfig.url}/store/${slug}`,
      images: product.thumbnailUrl ? [{ url: product.thumbnailUrl }] : [],
    },
    alternates: {
      canonical: `${siteConfig.url}/store/${slug}`,
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
      .filter((p) => p.id !== product.id && p.productTypeId === product.productTypeId)
      .slice(0, 3);
    reviews = reviewsResult?.data ?? [];
  } catch {
    /* silently ignore — non-critical data */
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Store", url: `${siteConfig.url}/store` },
          { name: product.name, url: `${siteConfig.url}/store/${product.slug}` },
        ]}
      />
      <ProductJsonLd product={product} reviews={reviews} />
      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
        reviews={reviews}
      />
    </>
  );
}
