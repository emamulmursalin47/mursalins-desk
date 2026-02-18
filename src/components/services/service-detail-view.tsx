"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import {
  createFadeUp,
  createStaggerFadeUp,
  createFadeIn,
} from "@/lib/gsap";
import type { Service } from "@/types/api";
import { Container } from "@/components/layout/container";
import { PricingTierCard } from "@/components/pricing/pricing-tier-card";

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

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-primary-500"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-muted-foreground/40"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

interface ServiceDetailViewProps {
  service: Service;
  relatedTiers: Service[];
}

export function ServiceDetailView({
  service,
  relatedTiers,
}: ServiceDetailViewProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const deliverablesRef = useRef<HTMLDivElement>(null);
  const exclusionsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (headerRef.current)
      createStaggerFadeUp(headerRef.current, "[data-animate]", {
        scrollTrigger: false,
      });
    if (descriptionRef.current)
      createFadeUp(descriptionRef.current, { delay: 0.3, scrollTrigger: false });
    if (deliverablesRef.current)
      createStaggerFadeUp(deliverablesRef.current, "[data-animate]");
    if (exclusionsRef.current)
      createStaggerFadeUp(exclusionsRef.current, "[data-animate]");
    if (featuresRef.current)
      createStaggerFadeUp(featuresRef.current, "[data-animate]");
    if (ctaRef.current) createFadeUp(ctaRef.current);
    if (compareRef.current)
      createStaggerFadeUp(compareRef.current, "[data-animate]");
    if (backRef.current)
      createFadeIn(backRef.current, { delay: 0.2 });
  });

  const ctaHref =
    service.ctaUrl ||
    `/contact?service=${service.category}&tier=${service.tier.toLowerCase()}`;
  const ctaText = service.ctaLabel || "Get Started";

  return (
    <div className="pb-24">
      {/* Header */}
      <section className="pt-24 pb-8">
        <Container>
          <div ref={headerRef} className="mx-auto max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2" data-animate>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${TIER_COLORS[service.tier] ?? "bg-foreground/5 text-muted-foreground"}`}
              >
                {TIER_LABELS[service.tier] ?? service.tier}
              </span>
              {service.categoryLabel && (
                <span className="rounded-full bg-foreground/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {service.categoryLabel}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              data-animate
            >
              {service.title}
            </h1>

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-2" data-animate>
              {service.price ? (
                <>
                  <span className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                    ${Number(service.price).toLocaleString()}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    /project
                  </span>
                </>
              ) : (
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  Custom Pricing
                </span>
              )}
            </div>

            {/* Tagline */}
            {service.tagline && (
              <p
                className="mt-3 text-lg text-muted-foreground"
                data-animate
              >
                {service.tagline}
              </p>
            )}

            {/* Meta pills */}
            <div
              className="mt-5 flex flex-wrap items-center gap-3"
              data-animate
            >
              {service.duration && (
                <span className="flex items-center gap-1.5 rounded-lg bg-foreground/5 px-3 py-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-muted-foreground"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-sm font-medium text-muted-foreground">
                    {service.duration}
                  </span>
                </span>
              )}
              {service.idealFor && (
                <span className="flex items-center gap-1.5 rounded-lg bg-primary-50/50 px-3 py-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-primary-500"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span className="text-sm font-medium text-primary-600/80">
                    {service.idealFor}
                  </span>
                </span>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Description */}
      {service.description && (
        <section className="py-6">
          <Container>
            <div
              ref={descriptionRef}
              data-gsap
              className="mx-auto max-w-3xl glass-card rounded-2xl border-l-4 border-l-primary-500 p-6 sm:p-8"
            >
              <p className="text-base leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </div>
          </Container>
        </section>
      )}

      {/* Deliverables */}
      {service.deliverables.length > 0 && (
        <section className="py-8">
          <Container>
            <div ref={deliverablesRef} className="mx-auto max-w-3xl">
              <h2
                className="mb-5 text-xl font-bold text-foreground"
                data-animate
              >
                What&apos;s Included
              </h2>
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {service.deliverables.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2.5"
                      data-animate
                    >
                      <span className="mt-0.5">
                        <CheckIcon />
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Exclusions */}
      {service.exclusions.length > 0 && (
        <section className="py-6">
          <Container>
            <div ref={exclusionsRef} className="mx-auto max-w-3xl">
              <h2
                className="mb-5 text-xl font-bold text-foreground"
                data-animate
              >
                Not Included
              </h2>
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {service.exclusions.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2.5"
                      data-animate
                    >
                      <span className="mt-0.5">
                        <XIcon />
                      </span>
                      <span className="text-sm text-muted-foreground/60">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Features */}
      {service.features.length > 0 && (
        <section className="py-6">
          <Container>
            <div ref={featuresRef} className="mx-auto max-w-3xl">
              <h2
                className="mb-5 text-xl font-bold text-foreground"
                data-animate
              >
                Key Features
              </h2>
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2.5"
                      data-animate
                    >
                      <span className="mt-0.5">
                        <CheckIcon />
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section className="py-10">
        <Container>
          <div
            ref={ctaRef}
            data-gsap
            className="mx-auto max-w-3xl glass-card rounded-3xl p-8 text-center sm:p-10"
          >
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Ready to Get Started?
            </h2>
            {service.price && (
              <p className="mt-2 text-muted-foreground">
                Starting at{" "}
                <span className="font-bold text-foreground">
                  ${Number(service.price).toLocaleString()}
                </span>{" "}
                for this package
              </p>
            )}
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-xl"
              >
                {ctaText}
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
              <Link
                href={`/pricing#${service.category}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
              >
                View All Pricing
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Compare Packages */}
      {relatedTiers.length > 0 && (
        <section className="py-10">
          <Container>
            <div ref={compareRef} className="mx-auto max-w-5xl">
              <h2
                className="mb-8 text-center text-2xl font-bold text-foreground"
                data-animate
              >
                Compare Packages
              </h2>
              <div
                className={`grid grid-cols-1 items-stretch gap-6 ${relatedTiers.length === 1 ? "md:grid-cols-1 max-w-lg mx-auto" : "md:grid-cols-2"}`}
              >
                {relatedTiers.map((tier) => (
                  <PricingTierCard key={tier.id} service={tier} />
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Back link */}
      <section className="py-6">
        <Container>
          <div ref={backRef} data-gsap className="mx-auto max-w-3xl">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to All Services
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
