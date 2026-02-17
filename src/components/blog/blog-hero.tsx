"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createStaggerFadeUp } from "@/lib/gsap";
import { Container } from "@/components/layout/container";

export function BlogHero() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (sectionRef.current) {
      createStaggerFadeUp(sectionRef.current, "[data-animate]", {
        scrollTrigger: false,
      });
    }
  });

  return (
    <section ref={sectionRef} className="relative overflow-hidden pt-32 pb-20">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-primary-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 right-1/4 h-80 w-80 rounded-full bg-accent-200/15 blur-3xl" />

      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h1
            data-animate
            className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            Blog
          </h1>
          <p
            data-animate
            className="mt-4 text-lg text-muted-foreground sm:text-xl"
          >
            Thoughts on development, design, and building digital products
          </p>
        </div>
      </Container>
    </section>
  );
}
