"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createStaggerFadeUp, createFadeUp } from "@/lib/gsap";
import { Container } from "@/components/layout/container";
import { PricingTierCard } from "./pricing-tier-card";
import type { ServiceCategory } from "@/types/api";

interface PricingCategoriesProps {
  categories: ServiceCategory[];
}

function CategorySection({ group }: { group: ServiceCategory }) {
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (headingRef.current) {
      createFadeUp(headingRef.current, { y: 20, duration: 0.5 });
    }
    if (gridRef.current) {
      createStaggerFadeUp(gridRef.current, "[data-animate]");
    }
  });

  return (
    <section
      id={group.category}
      className="relative scroll-mt-24 py-12 first:pt-0"
    >
      {/* Ambient orb per section */}
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-accent-100/20 blur-3xl" />

      <div ref={headingRef} className="mb-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {group.categoryLabel}
        </h2>
      </div>

      <div
        ref={gridRef}
        className="relative grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {group.tiers.map((service) => (
          <PricingTierCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}

export function PricingCategories({ categories }: PricingCategoriesProps) {
  if (categories.length === 0) {
    return (
      <section className="py-16">
        <Container>
          <p className="text-center text-muted-foreground">
            Service packages coming soon.
          </p>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-4">
      <Container>
        <div className="flex flex-col gap-8">
          {categories.map((group) => (
            <CategorySection key={group.category} group={group} />
          ))}
        </div>
      </Container>
    </section>
  );
}
