"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createFadeUp, createStaggerFadeUp } from "@/lib/gsap";
import { Container } from "@/components/layout/container";

export function AboutStory() {
  const quoteRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (quoteRef.current) {
      createFadeUp(quoteRef.current, { y: 30, duration: 0.7 });
    }
    if (bodyRef.current) {
      createStaggerFadeUp(bodyRef.current, "[data-animate]");
    }
  });

  return (
    <section className="relative py-16">
      <Container>
        <div className="mx-auto max-w-3xl">
          {/* Pull-quote */}
          <div ref={quoteRef} className="text-center">
            <p className="text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">
              &ldquo;I believe great software should feel invisible&nbsp;&mdash;
              it just works, and the people using it never have to think
              twice.&rdquo;
            </p>
          </div>

          {/* Gradient divider */}
          <div className="my-8 flex justify-center">
            <div className="h-px w-1/2 bg-linear-to-r from-transparent via-primary-400/40 to-transparent" />
          </div>

          {/* Story body */}
          <div ref={bodyRef} className="mx-auto max-w-2xl space-y-6">
            <p
              className="text-base leading-relaxed text-muted-foreground"
              data-animate
            >
              My journey into development started with curiosity&nbsp;&mdash; taking
              apart websites to understand how they worked, then rebuilding them
              better. That curiosity turned into a career spanning five years of
              building web applications for startups, agencies, and established
              businesses alike.
            </p>

            <p
              className="text-base leading-relaxed text-muted-foreground"
              data-animate
            >
              Today, I specialize in full-stack development with React, Next.js,
              and Node.js. I care deeply about the details: clean APIs,
              accessible interfaces, performant code, and designs that respect
              the user&apos;s time. Every project I take on is an opportunity to
              craft something meaningful.
            </p>

            <p
              className="text-base leading-relaxed text-muted-foreground"
              data-animate
            >
              When I&apos;m not coding, you&apos;ll find me exploring new
              technologies, contributing to open source, or writing about the
              lessons I&apos;ve learned along the way. I believe in continuous
              growth&nbsp;&mdash; both in code and as a person.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
