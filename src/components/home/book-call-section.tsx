"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createStaggerFadeUp } from "@/lib/gsap";
import { Container } from "@/components/layout/container";

export function BookCallSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    createStaggerFadeUp(containerRef.current, "[data-animate]", {
      stagger: 0.1,
    });
  });

  return (
    <section className="relative overflow-hidden py-16">
      <Container>
      <div className="mx-auto max-w-5xl">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary-200/30 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-accent-200/25 blur-3xl" />
      </div>

      <div
        ref={containerRef}
        className="glass-card glass-shine relative overflow-hidden rounded-3xl p-8 text-center sm:p-12 lg:p-16"
      >
        {/* Decorative shine */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary-200/10 via-transparent to-accent-200/10" />

        <p
          className="relative text-sm font-medium uppercase tracking-wider text-primary-500"
          data-animate
        >
          Let&apos;s Work Together
        </p>

        <h2
          className="relative mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          data-animate
        >
          Have a project in mind?
        </h2>

        <p
          className="relative mx-auto mt-4 max-w-lg text-muted-foreground"
          data-animate
        >
          Book a free 30-minute consultation to discuss your goals, timeline,
          and how I can help bring your ideas to life.
        </p>

        <div
          className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          data-animate
        >
          <Link
            href="/appointments"
            className="inline-flex items-center justify-center rounded-xl bg-primary-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/25"
          >
            Book a Free Call
          </Link>
          <Link
            href="/contact"
            className="glass inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg"
          >
            Send a Message
          </Link>
        </div>
      </div>
      </div>
      </Container>
    </section>
  );
}
