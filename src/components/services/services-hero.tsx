"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createStaggerFadeUp } from "@/lib/gsap";
import { Container } from "@/components/layout/container";

export function ServicesHero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (contentRef.current) {
      createStaggerFadeUp(contentRef.current, "[data-animate]", {
        scrollTrigger: false,
      });
    }
  });

  return (
    <section className="relative overflow-hidden pt-32 pb-16">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -right-40 h-125 w-125 rounded-full bg-primary-200/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-40 h-96 w-96 rounded-full bg-accent-200/20 blur-3xl" />
      </div>

      <Container>
        <div
          ref={contentRef}
          className="relative mx-auto max-w-3xl text-center"
        >
          <p
            data-animate
            className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary-500"
          >
            Services
          </p>
          <h1
            data-animate
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            What I Can Build For You
          </h1>
          <p
            data-animate
            className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground"
          >
            From landing pages to enterprise platforms — explore service
            packages tailored to your project scope and budget.
          </p>
        </div>
      </Container>
    </section>
  );
}
