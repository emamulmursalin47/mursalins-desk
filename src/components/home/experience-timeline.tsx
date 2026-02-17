"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { createFadeUp } from "@/lib/gsap";
import type { Experience } from "@/types/api";
import { Container } from "@/components/layout/container";

interface ExperienceTimelineProps {
  experiences: Experience[];
}

/* ── Helpers ── */

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function calcDuration(
  start: string,
  end: string | null,
  isCurrent: boolean,
): string {
  const s = new Date(start);
  const e = isCurrent ? new Date() : new Date(end!);
  const months =
    (e.getFullYear() - s.getFullYear()) * 12 + e.getMonth() - s.getMonth();
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs === 0) return `${mos} mo${mos !== 1 ? "s" : ""}`;
  if (mos === 0) return `${yrs} yr${yrs > 1 ? "s" : ""}`;
  return `${yrs} yr${yrs > 1 ? "s" : ""} ${mos} mo${mos > 1 ? "s" : ""}`;
}

function calcTotalYears(experiences: Experience[]): number {
  if (experiences.length === 0) return 0;
  let earliest = new Date();
  for (const exp of experiences) {
    const d = new Date(exp.startDate);
    if (d < earliest) earliest = d;
  }
  return Math.floor(
    (Date.now() - earliest.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

/* ── Spotlight handler ── */

function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty(
    "--mouse-x",
    `${e.clientX - rect.left}px`,
  );
  e.currentTarget.style.setProperty(
    "--mouse-y",
    `${e.clientY - rect.top}px`,
  );
}

/* ── Component ── */

export function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  const headingRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<SVGLineElement>(null);
  const beamHeadRef = useRef<SVGGElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [lineHeight, setLineHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const activeIndexRef = useRef(-1);

  const setNodeRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      nodeRefs.current[index] = el;
    },
    [],
  );

  const setCardRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      cardRefs.current[index] = el;
    },
    [],
  );

  // Measure timeline height for SVG
  useEffect(() => {
    function measure() {
      if (timelineRef.current) {
        setLineHeight(timelineRef.current.scrollHeight);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [experiences]);

  // Heading + node + card animations (no lineHeight dependency)
  useGSAP(
    () => {
      if (experiences.length === 0) return;

      // Heading fade up
      if (headingRef.current) {
        createFadeUp(headingRef.current, { y: 20, duration: 0.6 });
      }

      // Node entrance animations
      nodeRefs.current.forEach((node) => {
        if (!node) return;
        gsap.from(node, {
          scale: 0,
          opacity: 0,
          duration: 0.5,
          ease: "back.out(2)",
          scrollTrigger: {
            trigger: node,
            start: "top 85%",
            once: true,
          },
        });
      });

      // Card slide-in from sides + staggered children
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const isLeft = i % 2 === 0;

        gsap.from(card, {
          x: isLeft ? -30 : 30,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            once: true,
          },
        });

        const children = card.querySelectorAll("[data-reveal]");
        if (children.length > 0) {
          gsap.from(children, {
            opacity: 0,
            y: 10,
            duration: 0.35,
            stagger: 0.06,
            ease: "power2.out",
            delay: 0.15,
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              once: true,
            },
          });
        }
      });
    },
    { dependencies: [experiences.length] },
  );

  // Beam draw + head travel + active tracking (depends on lineHeight)
  useGSAP(
    () => {
      if (!beamRef.current || lineHeight <= 0) return;

      gsap.fromTo(
        beamRef.current,
        { strokeDashoffset: lineHeight },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 0.3,
            onUpdate: (self) => {
              const y = self.progress * lineHeight;
              beamHeadRef.current?.setAttribute(
                "transform",
                `translate(20, ${y})`,
              );

              const idx =
                self.progress < 0.02
                  ? -1
                  : Math.min(
                      Math.floor(self.progress * experiences.length),
                      experiences.length - 1,
                    );
              if (idx !== activeIndexRef.current) {
                activeIndexRef.current = idx;
                setActiveIndex(idx);
              }
            },
          },
        },
      );
    },
    { dependencies: [lineHeight, experiences.length] },
  );

  const currentIndex = experiences.findIndex((e) => e.isCurrent);
  const totalYears = calcTotalYears(experiences);

  return (
    <section className="relative overflow-hidden py-16">
      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-primary-200/30 blur-3xl" />
        <div className="absolute -right-20 top-2/3 h-72 w-72 rounded-full bg-accent-200/20 blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-primary-100/15 blur-3xl" />
      </div>

      <Container>
        <div className="mx-auto max-w-5xl">
          {/* Heading */}
          <div ref={headingRef} className="mb-20 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">
              Career
            </span>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              My Journey
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {totalYears}+ years of building digital experiences
            </p>
          </div>

          {/* Timeline */}
          <div ref={timelineRef} className="relative">
            {/* SVG Scroll Beam — zero-width with overflow:visible for glow */}
            {lineHeight > 0 && (
              <svg
                className="pointer-events-none absolute left-5 top-0 z-0 h-full -translate-x-1/2 sm:left-1/2"
                width="40"
                height={lineHeight}
                viewBox={`0 0 40 ${lineHeight}`}
                fill="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="beam-grad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="oklch(0.67 0.16 68)"
                      stopOpacity="0.9"
                    />
                    <stop
                      offset="90%"
                      stopColor="oklch(0.67 0.16 68)"
                      stopOpacity="0.4"
                    />
                    <stop
                      offset="100%"
                      stopColor="oklch(0.67 0.16 68)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                {/* Background track — dashed */}
                <line
                  x1="20"
                  y1="0"
                  x2="20"
                  y2={lineHeight}
                  stroke="oklch(0.70 0.01 260 / 0.5)"
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                />

                {/* Animated beam — solid, draws on scroll */}
                <line
                  ref={beamRef}
                  x1="20"
                  y1="0"
                  x2="20"
                  y2={lineHeight}
                  stroke="url(#beam-grad)"
                  strokeWidth="2.5"
                  strokeDasharray={lineHeight}
                  strokeDashoffset={lineHeight}
                  strokeLinecap="round"
                  className="timeline-beam"
                />

                {/* Beam head — traveling glow dot */}
                <g ref={beamHeadRef} transform="translate(20, 0)">
                  <circle
                    cx="0"
                    cy="0"
                    r="16"
                    fill="oklch(0.45 0.12 155 / 0.06)"
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r="8"
                    fill="oklch(0.45 0.12 155 / 0.15)"
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r="3.5"
                    fill="oklch(0.45 0.12 155 / 0.9)"
                    className="timeline-beam-head"
                  />
                </g>
              </svg>
            )}

            {/* Experience Items */}
            <div className="flex flex-col gap-16">
              {experiences.map((exp, i) => {
                const isLeft = i % 2 === 0;
                const isCurrent = exp.isCurrent;
                const isPast = currentIndex >= 0 && i > currentIndex;
                const isReached = i <= activeIndex;
                const isActive = i === activeIndex;

                return (
                  <div
                    key={exp.id}
                    className="relative flex items-start gap-6 sm:gap-0"
                  >
                    {/* Node */}
                    <div className="absolute left-5 top-5 z-10 -translate-x-1/2 sm:left-1/2">
                      <div
                        ref={setNodeRef(i)}
                        className={`timeline-node h-10 w-10 shrink-0 rounded-full transition-all duration-500 ${
                          isCurrent
                            ? "glass-heavy text-primary-600 ring-2 ring-primary-400 pulse-glow shadow-lg shadow-primary-500/20"
                            : isActive
                              ? "glass-heavy text-primary-600 ring-2 ring-primary-400/60 shadow-md shadow-primary-500/15"
                              : isReached
                                ? "glass text-primary-600"
                                : isPast
                                  ? "glass-subtle text-muted-foreground/50"
                                  : "glass-subtle text-muted-foreground"
                        }`}
                      >
                        {isReached && !isCurrent ? (
                          <span className="text-primary-500">
                            <CheckIcon />
                          </span>
                        ) : isCurrent ? (
                          <BriefcaseIcon />
                        ) : (
                          <span className="text-xs">{i + 1}</span>
                        )}
                      </div>
                    </div>

                    {/* Card */}
                    <div
                      className={`group/lift ml-16 w-full sm:ml-0 sm:w-[calc(50%-2.5rem)] ${
                        isLeft ? "sm:mr-auto" : "sm:ml-auto"
                      }`}
                    >
                      <div
                        ref={setCardRef(i)}
                        onMouseMove={handleMouseMove}
                        className={`glass-spotlight relative rounded-2xl transition-all duration-500 ease-out group-hover/lift:-translate-y-1 ${
                          isCurrent
                            ? "experience-card-current border-l-[3px] border-l-primary-500 p-6 group-hover/lift:shadow-xl group-hover/lift:shadow-primary-500/8"
                            : "experience-card p-5 group-hover/lift:shadow-lg group-hover/lift:shadow-black/5"
                        } ${
                          isActive && !isCurrent
                            ? "ring-1 ring-primary-400/20 shadow-md shadow-primary-500/5"
                            : ""
                        }`}
                      >
                        {/* Company logo — top right */}
                        {exp.companyLogo && (
                          <div className="absolute right-4 top-4 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/80 p-1 shadow-sm ring-1 ring-black/5">
                            <Image
                              src={exp.companyLogo}
                              alt={exp.company}
                              width={32}
                              height={32}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        )}

                        {/* Date + Duration badges */}
                        <div
                          data-reveal
                          className={`mb-3 flex flex-wrap items-center gap-2 ${exp.companyLogo ? "pr-14" : ""}`}
                        >
                          <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                            {formatDate(exp.startDate)} —{" "}
                            {isCurrent ? (
                              <span className="inline-flex items-center gap-1.5">
                                Present
                                <span className="inline-block h-2 w-2 rounded-full bg-success pulse-glow" />
                              </span>
                            ) : (
                              formatDate(exp.endDate)
                            )}
                          </span>
                          <span className="rounded-full glass-subtle px-2 py-0.5 text-xs text-muted-foreground">
                            {calcDuration(
                              exp.startDate,
                              exp.endDate,
                              exp.isCurrent,
                            )}
                          </span>
                        </div>

                        {/* Title + Company */}
                        <div data-reveal>
                          <h3
                            className={`font-semibold text-foreground ${
                              isCurrent ? "text-lg" : "text-base"
                            }`}
                          >
                            {exp.title}
                          </h3>
                          <p className="mt-0.5 text-sm font-medium text-primary-500">
                            {exp.company}
                            {exp.location && (
                              <span className="text-muted-foreground">
                                {" "}
                                &middot; {exp.location}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Description */}
                        {exp.description && (
                          <p
                            data-reveal
                            className="mt-2.5 text-sm leading-relaxed text-muted-foreground"
                          >
                            {exp.description}
                          </p>
                        )}

                        {/* Tech tags */}
                        {exp.technologies.length > 0 && (
                          <div
                            data-reveal
                            className="mt-3 flex flex-wrap gap-1.5"
                          >
                            {exp.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="glass-subtle rounded-md px-2 py-0.5 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
