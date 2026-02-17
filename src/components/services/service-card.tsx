"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import type { Service } from "@/types/api";

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-primary-500">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ServiceCard({ service }: { service: Service }) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isHovered = useRef(false);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!fillRef.current || !btnRef.current) return;
    isHovered.current = true;
    clearTimeout(leaveTimer.current);

    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Size the circle to cover the farthest corner
    const maxDist = Math.max(
      Math.hypot(x, y),
      Math.hypot(rect.width - x, y),
      Math.hypot(x, rect.height - y),
      Math.hypot(rect.width - x, rect.height - y),
    );
    const diameter = maxDist * 2;

    // Set size + position instantly at scale(0), then animate scale up
    fillRef.current.style.transition = "none";
    fillRef.current.style.left = `${x}px`;
    fillRef.current.style.top = `${y}px`;
    fillRef.current.style.width = `${diameter}px`;
    fillRef.current.style.height = `${diameter}px`;
    fillRef.current.style.transform = "translate(-50%, -50%) scale(0.02)";

    requestAnimationFrame(() => {
      if (fillRef.current) {
        fillRef.current.style.transition =
          "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)";
        fillRef.current.style.transform = "translate(-50%, -50%) scale(1)";
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!fillRef.current) return;
    isHovered.current = false;

    fillRef.current.style.transition =
      "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)";
    fillRef.current.style.transform = "translate(-50%, -50%) scale(0)";

    // Reset size after transition ends
    leaveTimer.current = setTimeout(() => {
      if (fillRef.current && !isHovered.current) {
        fillRef.current.style.width = "0px";
        fillRef.current.style.height = "0px";
      }
    }, 400);
  }, []);

  return (
    <div className="group/lift" data-animate>
    <article
      className="glass-card group relative flex h-112 flex-col rounded-2xl border border-transparent transition-[transform,box-shadow] duration-300 ease-out group-hover/lift:-translate-y-1 group-hover/lift:shadow-xl group-hover/lift:shadow-primary-500/8"
    >
      <div className="flex flex-1 flex-col p-6">
        {/* Header row: title + price */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-snug text-foreground">
            {service.title}
          </h3>
          {service.price && (
            <span className="shrink-0 rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-bold tabular-nums text-primary-700">
              ${Number(service.price).toLocaleString()}
            </span>
          )}
        </div>

        {service.description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {service.description}
          </p>
        )}

        {/* Divider */}
        <div className="my-5 h-px bg-border/50" />

        {/* Features */}
        {service.features.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {service.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2.5 text-sm text-muted-foreground"
              >
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>
        )}

        {/* CTA */}
        <div className="mt-auto pt-6">
          <Link
            ref={btnRef}
            href="/contact"
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-primary-500/20 px-4 py-2.5 text-sm font-semibold text-primary-600 transition-colors duration-200 hover:border-primary-500/40 hover:text-white"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span
              ref={fillRef}
              className="pointer-events-none absolute rounded-full bg-primary-600"
              style={{ width: 0, height: 0, transform: "translate(-50%, -50%) scale(0)" }}
            />
            <span className="relative z-10">Get Started</span>
            <svg className="relative z-10" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
    </div>
  );
}
