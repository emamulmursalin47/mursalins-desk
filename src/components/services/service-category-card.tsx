"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import type { ServiceCategory } from "@/types/api";
import { getLowestPrice } from "@/lib/services";

const TIER_LABEL_MAP: Record<string, string> = {
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
};

export function ServiceCategoryCard({ group }: { group: ServiceCategory }) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isHovered = useRef(false);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!fillRef.current || !btnRef.current) return;
      isHovered.current = true;
      clearTimeout(leaveTimer.current);

      const rect = btnRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDist = Math.max(
        Math.hypot(x, y),
        Math.hypot(rect.width - x, y),
        Math.hypot(x, rect.height - y),
        Math.hypot(rect.width - x, rect.height - y),
      );
      const diameter = maxDist * 2;

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
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    if (!fillRef.current) return;
    isHovered.current = false;

    fillRef.current.style.transition =
      "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)";
    fillRef.current.style.transform = "translate(-50%, -50%) scale(0)";

    leaveTimer.current = setTimeout(() => {
      if (fillRef.current && !isHovered.current) {
        fillRef.current.style.width = "0px";
        fillRef.current.style.height = "0px";
      }
    }, 400);
  }, []);

  const starter = group.tiers[0];
  const lowestPrice = getLowestPrice(group.tiers);
  const tierLabels = group.tiers
    .map((t) => TIER_LABEL_MAP[t.tier] ?? t.tier)
    .join(" / ");

  return (
    <div className="group/lift" data-animate>
      <article className="glass-card group relative flex h-full flex-col rounded-2xl border border-transparent transition-[transform,box-shadow] duration-300 ease-out group-hover/lift:-translate-y-1 group-hover/lift:shadow-xl group-hover/lift:shadow-primary-500/8">
        <div className="flex flex-1 flex-col p-6">
          {/* Header */}
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-500">
            {tierLabels}
          </p>
          <h3 className="mt-1.5 text-lg font-bold leading-snug text-foreground">
            {group.categoryLabel}
          </h3>

          {/* Price — hero element */}
          {lowestPrice !== null && (
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tabular-nums text-foreground">
                ${lowestPrice.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                / starting
              </span>
            </div>
          )}

          {/* Description from starter tier */}
          {starter?.description && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {starter.description}
            </p>
          )}

          {/* Divider */}
          <div className="my-5 h-px bg-border/50" />

          {/* CTA */}
          <div className="mt-auto">
            <Link
              ref={btnRef}
              href="/services"
              className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-primary-500/20 px-4 py-2.5 text-sm font-semibold text-primary-600 transition-colors duration-200 hover:border-primary-500/40 hover:text-white"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span
                ref={fillRef}
                className="pointer-events-none absolute rounded-full bg-primary-600"
                style={{
                  width: 0,
                  height: 0,
                  transform: "translate(-50%, -50%) scale(0)",
                }}
              />
              <span className="relative z-10">Explore Services</span>
              <svg
                className="relative z-10"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
