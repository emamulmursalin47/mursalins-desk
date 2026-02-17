"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SPRING_EASE, SPRING_DURATION } from "@/lib/gsap";

interface DashboardHeaderProps {
  onMenuToggle: () => void;
}

export function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        y: -56,
        opacity: 0,
        duration: SPRING_DURATION,
        ease: SPRING_EASE,
        delay: 0.15,
      });
    }
  });

  return (
    <header
      ref={headerRef}
      className="glass sticky top-0 z-30 flex h-14 items-center px-4 sm:px-6"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-foreground lg:hidden">
            Mursalin<span className="text-primary-500">&apos;s Desk</span>
          </h2>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="glass-subtle flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-primary-600 transition-transform duration-200 hover:scale-110 active:scale-95">
            M
          </div>
        </div>
      </div>
    </header>
  );
}
