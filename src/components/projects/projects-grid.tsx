"use client";

import { useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import {
  gsap,
  SPRING_EASE,
  SPRING_DURATION,
  createStaggerFadeUp,
  createFadeUp,
} from "@/lib/gsap";
import type { Project } from "@/types/api";
import { Container } from "@/components/layout/container";
import { ProjectCard } from "./project-card";

interface ProjectsGridProps {
  projects: Project[];
  meta: { page: number; totalPages: number } | null;
  industries: string[];
  activeIndustry: string | null;
}

/** Build /projects?... preserving industry when paginating */
function buildHref(page: number, industry?: string | null) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (industry) params.set("industry", industry);
  const qs = params.toString();
  return `/projects${qs ? `?${qs}` : ""}`;
}

export function ProjectsGrid({
  projects,
  meta,
  industries,
  activeIndustry,
}: ProjectsGridProps) {
  const router = useRouter();
  const filtersRef = useRef<HTMLDivElement>(null);
  const pillListRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const pillWave1Ref = useRef<HTMLSpanElement>(null);
  const pillWave2Ref = useRef<HTMLSpanElement>(null);
  const isFirstPill = useRef(true);
  const gridRef = useRef<HTMLDivElement>(null);

  /** Navigate to a filtered URL — resets to page 1 */
  const selectIndustry = useCallback(
    (industry: string | null) => {
      router.push(buildHref(1, industry));
    },
    [router],
  );

  // Sliding pill — measures active button and animates pill to it
  const updatePill = useCallback(() => {
    if (!pillListRef.current || !pillRef.current) return;
    const activeBtn = pillListRef.current.querySelector<HTMLElement>(
      "[data-filter-active='true']",
    );
    if (!activeBtn) {
      gsap.to(pillRef.current, { opacity: 0, duration: 0.2 });
      return;
    }
    const {
      offsetLeft: x,
      offsetTop: y,
      offsetWidth: width,
      offsetHeight: height,
    } = activeBtn;

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

  // Position pill on mount and when activeIndustry changes
  useEffect(() => {
    updatePill();
  }, [activeIndustry, updatePill]);

  // Reposition pill on resize
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
    if (filtersRef.current) {
      createFadeUp(filtersRef.current, { y: 16, scrollTrigger: false });
    }
    if (gridRef.current) {
      createStaggerFadeUp(gridRef.current, "[data-animate]");
    }
  });

  return (
    <section className="relative pb-16">
      <Container>
        {/* Category filter pills — sticky below navbar */}
        {industries.length > 0 && (
          <div
            ref={filtersRef}
            data-gsap
            className="sticky top-20 z-30 -mx-4 px-4 py-3 backdrop-blur-xl bg-background/80 sm:top-20 sm:mx-0 sm:px-0 sm:rounded-2xl"
          >
            <div ref={pillListRef} className="relative flex flex-wrap gap-2">
              {/* Sliding liquid pill */}
              <div
                ref={pillRef}
                className="pointer-events-none absolute left-0 top-0 will-change-transform rounded-full nav-pill-liquid"
                style={{ opacity: 0 }}
                aria-hidden="true"
              >
                {/* Water clip container */}
                <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                  <span ref={pillWave1Ref} className="nav-pill-wave-1" />
                  <span ref={pillWave2Ref} className="nav-pill-wave-2" />
                </span>
                {/* Glass highlight */}
                <span className="absolute inset-0 rounded-full pointer-events-none nav-pill-highlight" />
              </div>

              <button
                onClick={() => selectIndustry(null)}
                data-filter-active={!activeIndustry ? "true" : "false"}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 ${
                  !activeIndustry
                    ? "text-primary-600"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Projects
              </button>
              {industries.map((industry) => (
                <button
                  key={industry}
                  onClick={() =>
                    selectIndustry(
                      activeIndustry === industry ? null : industry,
                    )
                  }
                  data-filter-active={
                    activeIndustry === industry ? "true" : "false"
                  }
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 ${
                    activeIndustry === industry
                      ? "text-primary-600"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        <div
          ref={gridRef}
          className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {projects.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">
              No projects found matching your criteria.
            </p>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-3">
            {meta.page > 1 && (
              <Link
                href={buildHref(meta.page - 1, activeIndustry)}
                className="glass glass-shine rounded-xl px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5"
              >
                &larr; Previous
              </Link>
            )}
            <span className="px-4 text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            {meta.page < meta.totalPages && (
              <Link
                href={buildHref(meta.page + 1, activeIndustry)}
                className="glass glass-shine rounded-xl px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5"
              >
                Next &rarr;
              </Link>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
