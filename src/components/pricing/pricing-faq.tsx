"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createStaggerFadeUp } from "@/lib/gsap";
import { Container } from "@/components/layout/container";
import { pricingFaqs } from "@/lib/faq-data";

function FAQItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof pricingFaqs)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="glass-card rounded-xl" data-animate>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="pr-4 text-sm font-semibold text-foreground">
          {item.q}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-muted-foreground transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PricingFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (gridRef.current) {
      createStaggerFadeUp(gridRef.current, "[data-animate]");
    }
  });

  return (
    <section className="py-16">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Frequently Asked Questions
          </h2>

          <div ref={gridRef} className="flex flex-col gap-3">
            {pricingFaqs.map((item, idx) => (
              <FAQItem
                key={item.q}
                item={item}
                isOpen={openIdx === idx}
                onToggle={() => setOpenIdx(openIdx === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
