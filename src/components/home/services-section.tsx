"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createFadeUp, createStaggerFadeUp, createFadeIn } from "@/lib/gsap";
import type { Service } from "@/types/api";
import { Container } from "@/components/layout/container";
import { ServiceCard } from "@/components/services/service-card";

interface ServicesSectionProps {
  services: Service[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
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
      <div ref={headingRef} className="relative mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Services
        </h2>
        <p className="mt-3 text-muted-foreground">
          How I can help bring your vision to life
        </p>
      </div>

      <div
        ref={gridRef}
        className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      <div ref={ctaRef} className="mt-10 text-center">
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-xl bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-xl"
        >
          Discuss Your Project
        </Link>
      </div>
      </Container>
    </section>
  );
}

