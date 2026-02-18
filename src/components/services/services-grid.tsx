"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { createFadeUp, createStaggerFadeUp } from "@/lib/gsap";
import { Container } from "@/components/layout/container";
import type { ServiceCategory, Service } from "@/types/api";
import { getLowestPrice } from "@/lib/services";

const TIER_LABELS: Record<string, string> = {
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
};

const TIER_COLORS: Record<string, string> = {
  STARTER: "bg-foreground/5 text-muted-foreground",
  PROFESSIONAL: "bg-primary-50 text-primary-600",
  ENTERPRISE: "bg-accent-50 text-accent-600",
};

function ClockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ServiceTierLink({ service }: { service: Service }) {
  return (
    <div className="group/lift" data-animate>
      <Link
        href={`/services/${service.slug}`}
        className="glass-card group relative flex h-full flex-col rounded-2xl border border-transparent transition-[transform,box-shadow] duration-300 ease-out group-hover/lift:-translate-y-1 group-hover/lift:shadow-xl group-hover/lift:shadow-primary-500/8"
      >
        {service.isPopular && (
          <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primary-500 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg shadow-primary-500/25">
            Recommended
          </span>
        )}
        <div className="flex flex-1 flex-col p-6">
          {/* Tier badge */}
          <span
            className={`mb-3 self-start rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${TIER_COLORS[service.tier] ?? "bg-foreground/5 text-muted-foreground"}`}
          >
            {TIER_LABELS[service.tier] ?? service.tier}
          </span>

          {/* Price */}
          <div className="mb-1 flex items-baseline gap-1.5">
            {service.price ? (
              <>
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  ${Number(service.price).toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">/project</span>
              </>
            ) : (
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Custom Pricing
              </span>
            )}
          </div>

          {/* Tagline */}
          {service.tagline && (
            <p className="mb-4 text-sm text-muted-foreground">
              {service.tagline}
            </p>
          )}

          {/* Duration */}
          {service.duration && (
            <div className="mb-4 flex items-center gap-1.5 self-start rounded-lg bg-foreground/5 px-3 py-1.5">
              <ClockIcon />
              <span className="text-xs font-medium text-muted-foreground">
                {service.duration}
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="my-auto" />

          {/* View details CTA */}
          <div className="flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary-500 transition-colors group-hover/lift:text-primary-600">
            View Details
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover/lift:translate-x-0.5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
}

function CategorySection({ group }: { group: ServiceCategory }) {
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (headingRef.current) createFadeUp(headingRef.current, { y: 20 });
    if (gridRef.current) createStaggerFadeUp(gridRef.current, "[data-animate]");
  });

  const lowestPrice = getLowestPrice(group.tiers);

  return (
    <section className="relative scroll-mt-24 py-12 first:pt-0">
      <div
        className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-accent-100/20 blur-3xl"
        aria-hidden="true"
      />
      <div ref={headingRef} data-gsap className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {group.categoryLabel}
        </h2>
        {lowestPrice !== null && (
          <p className="mt-2 text-muted-foreground">
            Starting from{" "}
            <span className="font-semibold text-foreground">
              ${lowestPrice.toLocaleString()}
            </span>
          </p>
        )}
      </div>
      <div
        ref={gridRef}
        className="relative grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {group.tiers.map((service) => (
          <ServiceTierLink key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}

interface ServicesGridProps {
  categories: ServiceCategory[];
}

export function ServicesGrid({ categories }: ServicesGridProps) {
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
    <section className="py-4 pb-24">
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
