"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createStaggerFadeUp } from "@/lib/gsap";
import { Container } from "@/components/layout/container";

export function ProjectsHero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (contentRef.current) {
      createStaggerFadeUp(contentRef.current, "[data-animate]", {
        scrollTrigger: false,
      });
    }
  });

  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary-200/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-accent-200/15 blur-3xl" />
      </div>

      <Container>
        <div ref={contentRef} className="relative mx-auto max-w-3xl text-center">
          <h1
            className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            data-animate
          >
            Projects
          </h1>
          <p
            className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl"
            data-animate
          >
            A showcase of my work — from concept to completion. Each project
            represents a unique challenge solved with modern technology and
            thoughtful design.
          </p>
        </div>
      </Container>
    </section>
  );
}
