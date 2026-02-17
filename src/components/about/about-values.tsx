"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createFadeUp, createStaggerFadeUp } from "@/lib/gsap";
import { Container } from "@/components/layout/container";

const values = [
  {
    symbol: "{ }",
    title: "Clean Code",
    description:
      "Readable, maintainable, and well-tested. Code should communicate intent as clearly as prose.",
  },
  {
    symbol: "\u25CE",
    title: "User-First Design",
    description:
      "Every interface decision starts with the person using it. Performance, accessibility, and clarity come first.",
  },
  {
    symbol: "\u21C4",
    title: "Clear Communication",
    description:
      "No jargon, no surprises. I keep clients informed with regular updates and honest timelines.",
  },
  {
    symbol: "\u2191",
    title: "Continuous Growth",
    description:
      "Technology evolves, and so do I. I invest in learning so every project benefits from the latest thinking.",
  },
];

export function AboutValues() {
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (headingRef.current) {
      createFadeUp(headingRef.current, { y: 20, duration: 0.5 });
    }
    if (gridRef.current) {
      createStaggerFadeUp(gridRef.current, "[data-animate]");
    }
  });

  return (
    <section className="relative py-16">
      {/* Ambient orb */}
      <div className="pointer-events-none absolute left-0 top-1/3 h-80 w-80 rounded-full bg-primary-100/25 blur-3xl" />

      <Container>
        <div ref={headingRef} className="relative mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How I Work
          </h2>
          <p className="mt-3 text-muted-foreground">
            The principles behind every project
          </p>
        </div>

        <div
          ref={gridRef}
          className="relative mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2"
        >
          {values.map((value) => (
            <div key={value.title} className="group/lift" data-animate>
            <div
              className="glass-card glass-shine rounded-2xl p-8 will-change-transform transition-[transform,box-shadow] duration-300 ease-out group-hover/lift:-translate-y-1 group-hover/lift:shadow-xl group-hover/lift:shadow-primary-500/8"
            >
              <span className="mb-4 block text-2xl font-bold text-primary-500">
                {value.symbol}
              </span>
              <h3 className="text-base font-semibold text-foreground">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {value.description}
              </p>
            </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
