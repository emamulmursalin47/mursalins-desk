"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createStaggerFadeUp } from "@/lib/gsap";
import { Container } from "@/components/layout/container";
import { AvailabilityBadge } from "@/components/shared/availability-badge";
import type { SiteSetting } from "@/types/api";

interface ContactHeroProps {
  settings: SiteSetting[];
}

export function ContactHero({ settings }: ContactHeroProps) {
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
          <div data-animate className="mb-6 flex justify-center">
            <AvailabilityBadge settings={settings} />
          </div>

          <h1
            data-animate
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Let&apos;s Work Together
          </h1>

          <p
            data-animate
            className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground"
          >
            Have a project in mind? I&apos;d love to hear about it. Choose the
            option that works best for you.
          </p>
        </div>
      </Container>
    </section>
  );
}
