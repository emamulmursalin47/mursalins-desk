"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createStaggerFadeUp } from "@/lib/gsap";
import { Container } from "@/components/layout/container";

const steps = [
  {
    num: "01",
    title: "Inquiry",
    desc: "Reach out with your project idea",
  },
  {
    num: "02",
    title: "Discovery Call",
    desc: "We discuss goals, timeline, and scope",
  },
  {
    num: "03",
    title: "Proposal",
    desc: "Detailed plan with timeline and pricing",
  },
  {
    num: "04",
    title: "Agreement",
    desc: "Finalize terms and kick off the project",
  },
  {
    num: "05",
    title: "Development",
    desc: "Regular updates and milestone reviews",
  },
  {
    num: "06",
    title: "Delivery",
    desc: "Launch, handover, and ongoing support",
  },
];

export function ClientJourney() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    createStaggerFadeUp(containerRef.current, "[data-animate]", {
      scrollTrigger: true,
    });
  });

  return (
    <section className="relative py-16">
      <Container>
        <div ref={containerRef} className="mx-auto max-w-5xl">
          <div data-animate className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              How I Work
            </h2>
            <p className="mt-2 text-muted-foreground">
              A simple, transparent process from idea to launch
            </p>
          </div>

          {/* Desktop: horizontal */}
          <div className="hidden gap-3 lg:grid lg:grid-cols-6">
            {steps.map((step, i) => (
              <div key={step.num} data-animate className="relative">
                {/* Connecting line */}
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-8 h-px w-3 bg-border" />
                )}
                <div className="glass-card glass-shine rounded-2xl p-4 text-center">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 text-xs font-bold text-primary-600">
                    {step.num}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile/Tablet: vertical */}
          <div className="relative lg:hidden">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

            <div className="flex flex-col gap-6">
              {steps.map((step) => (
                <div
                  key={step.num}
                  data-animate
                  className="relative flex items-start gap-4 pl-12"
                >
                  {/* Node on line */}
                  <div className="absolute left-3.5 top-4">
                    <div className="h-3 w-3 rounded-full bg-primary-500 ring-4 ring-background" />
                  </div>

                  <div className="glass-card glass-shine flex-1 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/10 text-xs font-bold text-primary-600">
                        {step.num}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
