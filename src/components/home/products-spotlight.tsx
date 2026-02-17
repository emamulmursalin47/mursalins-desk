"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createFadeUp, createStaggerFadeUp, createFadeIn } from "@/lib/gsap";
import type { Product } from "@/types/api";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/products/product-card";

interface ProductsSpotlightProps {
  products: Product[];
}

export function ProductsSpotlight({ products }: ProductsSpotlightProps) {
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (headingRef.current) {
      createFadeUp(headingRef.current, { y: 20, duration: 0.5 });
    }
    if (gridRef.current) {
      createStaggerFadeUp(gridRef.current, "[data-animate]");
    }
    if (ctaRef.current) {
      createFadeIn(ctaRef.current, { delay: 0.4 });
    }
  });

  return (
    <section className="relative py-16">
      {/* Ambient orb */}
      <div className="pointer-events-none absolute right-0 bottom-20 h-96 w-96 rounded-full bg-accent-100/25 blur-3xl" />

      <Container>
      <div ref={headingRef} className="relative mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Digital Products
        </h2>
        <p className="mt-3 text-muted-foreground">
          Ready-made tools and templates to accelerate your projects
        </p>
      </div>

      <div
        ref={gridRef}
        className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div ref={ctaRef} className="mt-10 text-center">
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent-600 transition-colors hover:text-accent-700"
        >
          Browse all products &rarr;
        </Link>
      </div>
      </Container>
    </section>
  );
}
