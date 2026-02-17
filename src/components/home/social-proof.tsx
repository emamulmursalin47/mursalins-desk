"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createStaggerFadeUp } from "@/lib/gsap";
import { Container } from "@/components/layout/container";

const stats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "30+", label: "Happy Clients" },
  { value: "5+", label: "Years Experience" },
  { value: "10+", label: "Digital Products" },
];

export function SocialProof() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    createStaggerFadeUp(containerRef.current, "[data-animate]", {
      stagger: 0.1,
    });
  });

  return (
    <section className="relative py-16">
      <h2 className="sr-only">Project Statistics</h2>
      <Container>
        <div
          ref={containerRef}
          className="glass-card glass-shine mx-auto max-w-5xl rounded-2xl px-6 py-8"
        >
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center" data-animate>
                <p className="text-3xl font-bold text-primary-500 sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
