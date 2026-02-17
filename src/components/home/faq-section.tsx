"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createFadeUp, createStaggerFadeUp } from "@/lib/gsap";
import type { FAQ } from "@/types/api";
import { Container } from "@/components/layout/container";

interface FAQSectionProps {
  faqs: FAQ[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const headingRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (headingRef.current) {
      createFadeUp(headingRef.current, { y: 20, duration: 0.5 });
    }
    if (listRef.current) {
      createStaggerFadeUp(listRef.current, "[data-animate]");
    }
  });

  return (
    <section className="relative py-16">
      <Container>
      <div className="mx-auto max-w-3xl">
      <div ref={headingRef} className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-muted-foreground">
          Common questions about working with me
        </p>
      </div>

      <div ref={listRef} className="flex flex-col gap-3">
        {faqs.map((faq) => (
          <FAQItem key={faq.id} faq={faq} />
        ))}
      </div>
      </div>
      </Container>
    </section>
  );
}

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card glass-shine overflow-hidden rounded-xl" data-animate>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-foreground">
          {faq.question}
        </span>
        <span
          className="ml-4 shrink-0 text-muted-foreground transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-glass-border px-5 pb-4 pt-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {faq.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
