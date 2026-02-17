"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { ProductForm } from "@/components/dashboard/product-form";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader title="New Product" description="Add a new digital product." />
      <ProductForm />
    </div>
  );
}
