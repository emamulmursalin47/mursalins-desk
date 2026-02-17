"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, SPRING_EASE, SPRING_DURATION } from "@/lib/gsap";
import { Container } from "@/components/layout/container";
import { QuickMessageForm } from "@/components/contact/quick-message-form";
import { ProjectWizard } from "@/components/contact/project-wizard";
import type { Service, SiteSetting } from "@/types/api";

interface ContactTabsProps {
  services: Service[];
  settings: SiteSetting[];
}

export function ContactTabs({ services }: ContactTabsProps) {
  const searchParams = useSearchParams();
  const hasService = searchParams.get("service");

  const [activeTab, setActiveTab] = useState<"quick" | "project">(
    hasService ? "project" : "quick",
  );

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
      // Slide the pill
      gsap.to(pillRef.current, {
        x,
        y,
        width,
        height,
        opacity: 1,
        duration: SPRING_DURATION,
        ease: SPRING_EASE,
        force3D: true,
      });

      // Water slosh — inertia pushes water opposite to slide direction
      if (pillWave1Ref.current && pillWave2Ref.current) {
        const currentX = gsap.getProperty(pillRef.current, "x") as number;
        const dx = x - currentX;
        const inertiaX = dx > 0 ? -30 : 30;

        gsap.killTweensOf(pillWave1Ref.current);
        gsap.killTweensOf(pillWave2Ref.current);

        // Wave 1 — horizontal slosh + rotation burst
        gsap.fromTo(
          pillWave1Ref.current,
          { x: inertiaX, rotation: "+=0" },
          {
            x: 0,
            rotation: "+=120",
            duration: 1,
            ease: "elastic.out(1, 0.3)",
          },
        );

        // Wave 2 — offset amplitude + counter-rotation
        gsap.fromTo(
          pillWave2Ref.current,
          { x: inertiaX * 0.65 },
          {
            x: 0,
            rotation: "-=90",
            duration: 1.2,
            ease: "elastic.out(1, 0.35)",
          },
        );

        // Pill body wobble — squish then bounce
        gsap.fromTo(
          pillRef.current,
          { scaleY: 0.88 },
          { scaleY: 1, duration: 0.6, ease: "elastic.out(1.2, 0.4)" },
        );
      }
    }
  }, []);

  // Update pill when tab changes
  useEffect(() => {
    updatePill();
  }, [activeTab, updatePill]);

  // Reposition on resize
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

  // Initial pill placement after mount
  useGSAP(() => {
    updatePill();
  });

  return (
    <section className="relative py-16">
      <Container>
        <div className="mx-auto max-w-4xl">
          {/* Tab switcher */}
          <div className="mb-8 flex justify-center">
            <div
              ref={containerRef}
              className="glass relative inline-flex rounded-xl p-1"
            >
              {/* Sliding pill */}
              <span
                ref={pillRef}
                className="pointer-events-none absolute left-0 top-0 will-change-transform rounded-lg nav-pill-liquid"
                style={{ opacity: 0 }}
                aria-hidden="true"
              >
                {/* Water clip container */}
                <span className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                  <span ref={pillWave1Ref} className="nav-pill-wave-1" />
                  <span ref={pillWave2Ref} className="nav-pill-wave-2" />
                </span>
                <span className="absolute inset-0 rounded-lg pointer-events-none nav-pill-highlight" />
              </span>

              <button
                onClick={() => setActiveTab("quick")}
                data-tab-active={activeTab === "quick" ? "true" : "false"}
                className={`relative z-10 rounded-lg px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === "quick"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Quick Message
              </button>
              <button
                onClick={() => setActiveTab("project")}
                data-tab-active={activeTab === "project" ? "true" : "false"}
                className={`relative z-10 rounded-lg px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === "project"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Project Builder
              </button>
            </div>
          </div>

          {/* Tab content */}
          {activeTab === "quick" ? (
            <QuickMessageForm />
          ) : (
            <ProjectWizard
              services={services}
              preselectedService={hasService || undefined}
            />
          )}
        </div>
      </Container>
    </section>
  );
}
