"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createFadeUp, createStaggerFadeUp, createFadeIn } from "@/lib/gsap";
import type { ServiceCategory } from "@/types/api";
import { Container } from "@/components/layout/container";
import { ServiceCategoryCard } from "@/components/services/service-category-card";

interface ServicesSectionProps {
  categories: ServiceCategory[];
}

export function ServicesSection({ categories }: ServicesSectionProps) {
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
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-accent-100/30 blur-3xl" />

      <Container>
        <div ref={headingRef} data-gsap className="relative mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Service Packages
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tailored solutions for every stage of your project
          </p>
        </div>

        <div
          ref={gridRef}
          className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((group) => (
            <ServiceCategoryCard key={group.category} group={group} />
          ))}
        </div>

        <div ref={ctaRef} data-gsap className="mt-10 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-xl"
          >
            View All Packages
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </Container>
    </section>
  );
}
