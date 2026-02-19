"use client";

import { useRef, useCallback, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SPRING_EASE, SPRING_DURATION } from "@/lib/gsap";

interface FilterTabsProps {
  tabs: readonly string[];
  active: string;
  onChange: (tab: string) => void;
  formatLabel?: (tab: string) => string;
}

export function FilterTabs({ tabs, active, onChange, formatLabel }: FilterTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const pillWave1Ref = useRef<HTMLSpanElement>(null);
  const pillWave2Ref = useRef<HTMLSpanElement>(null);
  const isFirstPill = useRef(true);

  const updatePill = useCallback(() => {
    if (!containerRef.current || !pillRef.current) return;
    const activeBtn = containerRef.current.querySelector<HTMLElement>(
      "[data-tab-active='true']",
    );
    if (!activeBtn) return;

    const { offsetLeft: x, offsetTop: y, offsetWidth: width, offsetHeight: height } = activeBtn;

    if (isFirstPill.current) {
      gsap.set(pillRef.current, { x, y, width, height, opacity: 1 });
      isFirstPill.current = false;
    } else {
      gsap.to(pillRef.current, {
        x, y, width, height, opacity: 1,
        duration: SPRING_DURATION,
        ease: SPRING_EASE,
        force3D: true,
      });

      if (pillWave1Ref.current && pillWave2Ref.current) {
        const currentX = gsap.getProperty(pillRef.current, "x") as number;
        const dx = x - currentX;
        const inertiaX = dx > 0 ? -30 : 30;

        gsap.killTweensOf(pillWave1Ref.current);
        gsap.killTweensOf(pillWave2Ref.current);

        gsap.fromTo(
          pillWave1Ref.current,
          { x: inertiaX, rotation: "+=0" },
          { x: 0, rotation: "+=120", duration: 1, ease: "elastic.out(1, 0.3)" },
        );

        gsap.fromTo(
          pillWave2Ref.current,
          { x: inertiaX * 0.65 },
          { x: 0, rotation: "-=90", duration: 1.2, ease: "elastic.out(1, 0.35)" },
        );

        gsap.fromTo(
          pillRef.current,
          { scaleY: 0.88 },
          { scaleY: 1, duration: 0.6, ease: "elastic.out(1.2, 0.4)" },
        );
      }
    }
  }, []);

  useEffect(() => {
    updatePill();
  }, [active, updatePill]);

  useEffect(() => {
    let raf: number;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updatePill);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [updatePill]);

  useGSAP(() => {
    updatePill();
  });

  const label = (t: string) => {
    if (formatLabel) return formatLabel(t);
    if (t === "All") return "All";
    return t.replace(/_/g, " ");
  };

  return (
    <div
      ref={containerRef}
      data-animate
      className="glass relative mb-6 inline-flex flex-wrap rounded-xl p-1"
    >
      <span
        ref={pillRef}
        className="pointer-events-none absolute left-0 top-0 will-change-transform rounded-lg nav-pill-liquid"
        style={{ opacity: 0 }}
        aria-hidden="true"
      >
        <span className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          <span ref={pillWave1Ref} className="nav-pill-wave-1" />
          <span ref={pillWave2Ref} className="nav-pill-wave-2" />
        </span>
        <span className="absolute inset-0 rounded-lg pointer-events-none nav-pill-highlight" />
      </span>

      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          data-tab-active={active === t ? "true" : "false"}
          className={`relative z-10 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
            active === t
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {label(t)}
        </button>
      ))}
    </div>
  );
}
