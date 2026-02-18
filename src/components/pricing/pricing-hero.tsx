"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createStaggerFadeUp } from "@/lib/gsap";
import { Container } from "@/components/layout/container";

export function PricingHero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!contentRef.current) return;
    createStaggerFadeUp(contentRef.current, "[data-animate]");
  });

  return (
    <section className="relative overflow-hidden pt-32 pb-16">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-125 w-125 rounded-full bg-primary-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-40 h-96 w-96 rounded-full bg-accent-200/20 blur-3xl" />

      <Container>
        <div
          ref={contentRef}
          className="relative mx-auto max-w-3xl text-center"
        >
          <p
            data-animate
            className="mb-4 text-sm font-semibold tracking-widest text-primary-500 uppercase"
          >
            Pricing
          </p>

          <h1
            data-animate
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Simple, Transparent Pricing
          </h1>

          <p
            data-animate
            className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground"
          >
            Choose a package that matches your project scope. Every tier
            includes a dedicated development process with clear deliverables.
          </p>
        </div>
      </Container>
    </section>
  );
}
