"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminGet } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductForm } from "@/components/dashboard/product-form";
import { LoadingState } from "@/components/dashboard/loading-state";
import type { AdminProduct } from "@/types/admin";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGet<AdminProduct>(`/products/${id}`)
      .then(setProduct)
      .catch(() => router.push("/dashboard/products"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <LoadingState />;
  if (!product) return null;

  return (
    <div>
      <PageHeader title="Edit Product" description={`Editing: ${product.name}`} action={
        <button onClick={() => router.push("/dashboard/products")} className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium">&larr; Back</button>
      } />
      <ProductForm product={product} />
    </div>
  );
}
