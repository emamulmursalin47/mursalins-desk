"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import {
  gsap,
  SPRING_EASE,
  SPRING_DURATION,
  createStaggerFadeUp,
  createFadeUp,
} from "@/lib/gsap";
import type { Product, ProductType } from "@/types/api";
import { Container } from "@/components/layout/container";
import { ProductCard } from "./product-card";

const typeLabels: Record<ProductType, string> = {
  TEMPLATE: "Templates",
  COMPONENT: "Components",
  FULL_APPLICATION: "Full Apps",
  PLUGIN: "Plugins",
  DESIGN_ASSET: "Design Assets",
  OTHER: "Other",
};

interface ProductsGridProps {
  products: Product[];
  meta: { page: number; totalPages: number } | null;
}

export function ProductsGrid({ products, meta }: ProductsGridProps) {
  const filtersRef = useRef<HTMLDivElement>(null);
  const pillListRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const pillWave1Ref = useRef<HTMLSpanElement>(null);
  const pillWave2Ref = useRef<HTMLSpanElement>(null);
  const isFirstPill = useRef(true);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeType, setActiveType] = useState<ProductType | null>(null);

  const allTypes = useMemo(() => {
    const counts = new Map<ProductType, number>();
    for (const p of products) {
      counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type);
  }, [products]);

  const filtered = useMemo(() => {
    if (!activeType) return products;
    return products.filter((p) => p.type === activeType);
  }, [products, activeType]);

  // Sliding pill — measures active button and animates pill to it
  const updatePill = useCallback(() => {
    if (!pillListRef.current || !pillRef.current) return;
    const activeBtn = pillListRef.current.querySelector<HTMLElement>(
      "[data-filter-active='true']",
    );
    if (!activeBtn) {
      gsap.to(pillRef.current, { opacity: 0, duration: 0.2 });
      return;
    }
    const {
      offsetLeft: x,
      offsetTop: y,
      offsetWidth: width,
      offsetHeight: height,
    } = activeBtn;

    if (isFirstPill.current) {
      gsap.set(pillRef.current, { x, y, width, height, opacity: 1 });
      isFirstPill.current = false;
    } else {
      gsap.to(pillRef.current, {
        x,
        y,
        width,
        height,
        opacity: 1,
        duration: SPRING_DURATION,
        ease: SPRING_EASE,
        force3D: true,
      });

      if (pillWave1Ref.current && pillWave2Ref.current) {
        const currentX = gsap.getProperty(pillRef.current, "x") as number;
        const dx = x - currentX;
        const inertiaX = dx > 0 ? -30 : 30;

        gsap.killTweensOf(pillWave1Ref.current);
        gsap.killTweensOf(pillWave2Ref.current);

        gsap.fromTo(
          pillWave1Ref.current,
          { x: inertiaX, rotation: "+=0" },
          {
            x: 0,
            rotation: "+=120",
            duration: 1,
            ease: "elastic.out(1, 0.3)",
          },
        );

        gsap.fromTo(
          pillWave2Ref.current,
          { x: inertiaX * 0.65 },
          {
            x: 0,
            rotation: "-=90",
            duration: 1.2,
            ease: "elastic.out(1, 0.35)",
          },
        );

        gsap.fromTo(
          pillRef.current,
          { scaleY: 0.88 },
          { scaleY: 1, duration: 0.6, ease: "elastic.out(1.2, 0.4)" },
        );
      }
    }
  }, []);

  useEffect(() => {
    updatePill();
  }, [activeType, updatePill]);

  useEffect(() => {
    let raf: number;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updatePill);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [updatePill]);

  useGSAP(() => {
    if (filtersRef.current) {
      createFadeUp(filtersRef.current, { y: 16, scrollTrigger: false });
    }
    if (gridRef.current) {
      createStaggerFadeUp(gridRef.current, "[data-animate]");
    }
  });

  return (
    <section className="relative pb-16">
      <Container>
        {/* Type filter pills — sticky below navbar */}
        {allTypes.length > 0 && (
          <div
            ref={filtersRef}
            className="sticky top-20 z-30 -mx-4 px-4 py-3 backdrop-blur-xl bg-background/80 sm:top-20 sm:mx-0 sm:px-0 sm:rounded-2xl"
          >
            <div ref={pillListRef} className="relative flex flex-wrap gap-2">
              {/* Sliding liquid pill */}
              <div
                ref={pillRef}
                className="pointer-events-none absolute left-0 top-0 will-change-transform rounded-full nav-pill-liquid"
                style={{ opacity: 0 }}
                aria-hidden="true"
              >
                <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                  <span ref={pillWave1Ref} className="nav-pill-wave-1" />
                  <span ref={pillWave2Ref} className="nav-pill-wave-2" />
                </span>
                <span className="absolute inset-0 rounded-full pointer-events-none nav-pill-highlight" />
              </div>

              <button
                onClick={() => setActiveType(null)}
                data-filter-active={!activeType ? "true" : "false"}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 ${
                  !activeType
                    ? "text-primary-600"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Products
              </button>
              {allTypes.map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setActiveType(activeType === type ? null : type)
                  }
                  data-filter-active={activeType === type ? "true" : "false"}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 ${
                    activeType === type
                      ? "text-primary-600"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {typeLabels[type]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        <div
          ref={gridRef}
          className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">
              No products found matching your criteria.
            </p>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-3">
            {meta.page > 1 && (
              <Link
                href={`/store?page=${meta.page - 1}`}
                className="glass glass-shine rounded-xl px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5"
              >
                &larr; Previous
              </Link>
            )}
            <span className="px-4 text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            {meta.page < meta.totalPages && (
              <Link
                href={`/store?page=${meta.page + 1}`}
                className="glass glass-shine rounded-xl px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5"
              >
                Next &rarr;
              </Link>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
