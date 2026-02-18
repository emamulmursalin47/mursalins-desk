"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import type { Service } from "@/types/api";

const TIER_LABELS: Record<string, string> = {
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
};

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-primary-500"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-muted-foreground/40"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-muted-foreground"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function PricingTierCard({ service }: { service: Service }) {
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

  const ctaHref =
    service.ctaUrl ||
    `/contact?service=${service.category}&tier=${service.tier.toLowerCase()}`;
  const ctaText = service.ctaLabel || "Get Started";

  return (
    <div className="relative" data-animate>
      {/* Recommended badge — outside the card to avoid overflow:hidden clipping */}
      {service.isPopular && (
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primary-500 px-3.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-lg shadow-primary-500/25 uppercase">
          Recommended
        </span>
      )}

      <article
        className={`glass-card relative flex h-full flex-col rounded-2xl transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/8 ${
          service.isPopular
            ? "ring-2 ring-primary-500/30 border-primary-500/20"
            : "border border-transparent"
        }`}
      >
        <div className="flex flex-1 flex-col p-6">
          {/* Tier badge */}
          <span className="mb-3 self-start rounded-full bg-foreground/5 px-3 py-1 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
            {TIER_LABELS[service.tier] ?? service.tier}
          </span>

          {/* Price */}
          <div className="mb-1 flex items-baseline gap-1.5">
            {service.price ? (
              <>
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  ${Number(service.price).toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">/project</span>
              </>
            ) : (
              <span className="text-3xl font-bold tracking-tight text-foreground">
                Custom
              </span>
            )}
          </div>

          {/* Tagline */}
          {service.tagline && (
            <p className="mb-4 text-sm text-muted-foreground">
              {service.tagline}
            </p>
          )}

          {/* Duration */}
          {service.duration && (
            <div className="mb-5 flex items-center gap-1.5 rounded-lg bg-foreground/5 px-3 py-1.5 self-start">
              <ClockIcon />
              <span className="text-xs font-medium text-muted-foreground">
                {service.duration}
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="mb-5 h-px bg-border/50" />

          {/* Deliverables */}
          {service.deliverables.length > 0 && (
            <div className="mb-5">
              <h4 className="mb-3 text-xs font-semibold tracking-widest text-foreground/70 uppercase">
                What&apos;s included
              </h4>
              <ul className="flex flex-col gap-2.5">
                {service.deliverables.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5">
                      <CheckIcon />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fallback: show features if no deliverables */}
          {service.deliverables.length === 0 && service.features.length > 0 && (
            <div className="mb-5">
              <h4 className="mb-3 text-xs font-semibold tracking-widest text-foreground/70 uppercase">
                Features
              </h4>
              <ul className="flex flex-col gap-2.5">
                {service.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5">
                      <CheckIcon />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ideal for */}
          {service.idealFor && (
            <div className="mb-5 rounded-xl bg-primary-50/50 px-4 py-3">
              <p className="text-xs font-semibold text-primary-700">
                Ideal for
              </p>
              <p className="mt-0.5 text-sm text-primary-600/80">
                {service.idealFor}
              </p>
            </div>
          )}

          {/* Exclusions */}
          {service.exclusions.length > 0 && (
            <div className="mb-5">
              <h4 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground/50 uppercase">
                Not included
              </h4>
              <ul className="flex flex-col gap-2">
                {service.exclusions.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground/50"
                  >
                    <span className="mt-0.5">
                      <XIcon />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="mt-auto pt-4">
            <Link
              ref={btnRef}
              href={ctaHref}
              className={`relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                service.isPopular
                  ? "bg-primary-500 text-white hover:bg-primary-600"
                  : "border border-primary-500/20 text-primary-600 hover:border-primary-500/40 hover:text-white"
              }`}
              onMouseEnter={service.isPopular ? undefined : handleMouseEnter}
              onMouseLeave={service.isPopular ? undefined : handleMouseLeave}
            >
              {!service.isPopular && (
                <span
                  ref={fillRef}
                  className="pointer-events-none absolute rounded-full bg-primary-600"
                  style={{
                    width: 0,
                    height: 0,
                    transform: "translate(-50%, -50%) scale(0)",
                  }}
                />
              )}
              <span className="relative z-10">{ctaText}</span>
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
