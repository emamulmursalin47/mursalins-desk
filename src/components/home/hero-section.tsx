"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import {
  gsap,
  createStaggerFadeUp,
  createFadeUp,
  GSAP_EASE,
} from "@/lib/gsap";
import { Container } from "@/components/layout/container";
import type { TrustedCompany, Testimonial, Experience } from "@/types/api";

const TESTIMONIAL_INTERVAL = 6000;

function computeYearsOfExperience(experiences: Experience[]): number {
  if (experiences.length === 0) return 0;
  const earliest = experiences.reduce((min, exp) => {
    const d = new Date(exp.startDate).getTime();
    return d < min ? d : min;
  }, Infinity);
  return Math.floor(
    (Date.now() - earliest) / (365.25 * 24 * 60 * 60 * 1000),
  );
}

interface HeroSectionProps {
  trustedCompanies?: TrustedCompany[];
  featuredTestimonial?: Testimonial | null;
  testimonials?: Testimonial[];
  totalProjects?: number;
  totalClients?: number;
  experiences?: Experience[];
}

export function HeroSection({
  trustedCompanies = [],
  featuredTestimonial,
  testimonials = [],
  totalProjects = 0,
  totalClients = 0,
  experiences = [],
}: HeroSectionProps) {
  const yearsExp = computeYearsOfExperience(experiences);

  const stats = [
    {
      value: totalProjects > 0 ? `${totalProjects}+` : "50+",
      label: "Projects Delivered",
    },
    {
      value: yearsExp > 0 ? `${yearsExp}+` : "5+",
      label: "Years Experience",
    },
    {
      value: totalClients > 0 ? `${totalClients}+` : "30+",
      label: "Happy Clients",
    },
  ];
  const leftRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  // Auto-cycling testimonials
  const allTestimonials = testimonials.length > 0
    ? testimonials
    : featuredTestimonial
      ? [featuredTestimonial]
      : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const isPaused = useRef(false);

  const cycleTestimonial = useCallback(() => {
    if (allTestimonials.length <= 1 || isPaused.current) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % allTestimonials.length);
      setIsAnimating(false);
    }, 400);
  }, [allTestimonials.length]);

  useEffect(() => {
    if (allTestimonials.length <= 1) return;
    const timer = setInterval(cycleTestimonial, TESTIMONIAL_INTERVAL);
    return () => clearInterval(timer);
  }, [cycleTestimonial, allTestimonials.length]);

  const currentTestimonial = allTestimonials[activeIndex] ?? null;

  useGSAP(() => {
    if (leftRef.current) {
      createStaggerFadeUp(leftRef.current, "[data-animate]", {
        scrollTrigger: false,
      });
    }
    if (photoRef.current) {
      gsap.from(photoRef.current, {
        autoAlpha: 0,
        x: 40,
        scale: 0.95,
        duration: 1,
        ease: GSAP_EASE,
        delay: 0.4,
        immediateRender: true,
        onComplete() {
          photoRef.current?.removeAttribute("data-gsap");
          gsap.set(photoRef.current, { clearProps: "all" });
        },
      });

      const frame = photoRef.current.querySelector("[data-parallax-frame]");
      const cards = photoRef.current.querySelectorAll("[data-parallax-card]");

      if (frame) {
        gsap.to(frame, {
          y: -25,
          ease: "none",
          scrollTrigger: {
            trigger: photoRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      cards.forEach((card) => {
        const speed = parseFloat(
          (card as HTMLElement).dataset.parallaxCard || "1",
        );
        gsap.to(card, {
          y: -40 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: photoRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }
    if (trustRef.current) {
      createFadeUp(trustRef.current, {
        scrollTrigger: false,
        delay: 0.8,
        y: 20,
      });
    }
  });

  return (
    <section className="relative overflow-hidden pt-28 pb-14">
      {/* Ambient background orbs */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -right-40 h-125 w-125 rounded-full bg-primary-200/30 blur-3xl liquid-float" />
        <div className="absolute top-1/3 -left-32 h-100 w-100 rounded-full bg-accent-200/20 blur-3xl liquid-float [animation-delay:2s]" />
        <div className="absolute bottom-0 right-1/4 h-87.5 w-87.5 rounded-full bg-primary-100/25 blur-3xl liquid-float [animation-delay:4s]" />
        <div className="absolute top-1/4 right-1/6 hidden h-80 w-80 rounded-full bg-primary-300/15 blur-3xl lg:block" />
      </div>

      <Container>
        {/* Main split layout */}
        <div className="relative grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — Text content */}
          <div ref={leftRef} className="flex flex-col gap-6">
            {/* Availability badge */}
            <div
              className="glass-card glass-shine inline-flex w-fit items-center gap-2.5 rounded-full px-5 py-2 text-sm font-medium text-primary-600"
              data-animate
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success pulse-glow" />
              </span>
              Available for New Projects
            </div>

            <h1
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              data-animate
            >
              I Build Web Apps That{" "}
              <span className="bg-linear-to-r from-primary-500 via-primary-400 to-accent-500 bg-clip-text text-transparent">
                Grow Your Business
              </span>
            </h1>

            <p
              className="max-w-lg text-lg leading-relaxed text-muted-foreground"
              data-animate
            >
              Full-stack developer specializing in modern web applications, SaaS
              platforms, and e-commerce solutions for startups and businesses.
            </p>

            {/* Inline stats */}
            <div className="flex items-center gap-4 sm:gap-6" data-animate>
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-4 sm:gap-6"
                >
                  <div className="glass-stat rounded-xl px-4 py-2.5 text-center">
                    <p className="text-xl font-bold text-primary-500 sm:text-2xl">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                  {i < stats.length - 1 && (
                    <div className="h-8 w-px bg-border/50" />
                  )}
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-3 sm:flex-row" data-animate>
              <Link
                href="/projects"
                className="btn-glass-primary inline-flex items-center justify-center rounded-2xl px-7 py-3.5 text-sm font-semibold text-white"
              >
                Explore My Projects
              </Link>
              <Link
                href="/appointments"
                className="btn-glass-secondary inline-flex items-center justify-center rounded-2xl px-7 py-3.5 text-sm font-semibold text-foreground"
              >
                Book a Free Call
              </Link>
            </div>
          </div>

          {/* Right — Photo + floating cards */}
          <div
            ref={photoRef}
            data-gsap
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative h-104 w-84 max-w-full sm:h-128 sm:w-100">
              <div
                data-parallax-frame
                className="glass-frame glass-shine relative h-full w-full overflow-hidden rounded-3xl px-2 pt-2"
              >
                <Image
                  src="/hero.png"
                  alt="Mursalin"
                  fill
                  priority
                  sizes="(max-width: 640px) 336px, 400px"
                  className="rounded-t-2xl object-cover object-top drop-shadow-2xl"
                />
              </div>

              <div
                data-parallax-card="0.6"
                className="absolute -bottom-5 -right-6 z-10 hidden sm:block lg:-right-10"
              >
                <div className="glass-heavy glass-shine liquid-float liquid-morph rounded-2xl p-4 [animation-delay:1s]">
                  <div className="flex items-center gap-2.5">
                    <div>
                      <p className="text-2xl font-bold text-primary-500">98%</p>
                      <p className="text-[10px] font-medium text-muted-foreground">
                        Client Satisfaction
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-xs text-accent-400">
                          &#9733;
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div
                data-parallax-card="1.0"
                className="absolute top-1/3 -left-14 z-10 hidden sm:block lg:-left-20"
              >
                <div className="glass-card glass-shine liquid-float rounded-xl p-3 [animation-delay:5s]">
                  <p className="text-[10px] font-medium text-muted-foreground">
                    Avg. Response
                  </p>
                  <p className="text-lg font-bold text-primary-500">
                    &lt; 2hrs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust section */}
        {trustedCompanies.length > 0 && <div ref={trustRef} data-gsap className="relative mt-20 w-full">
          <div className="flex flex-col items-center gap-6">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
              Trusted by innovative companies
            </p>

            {/* Infinite scroll marquee */}
            <div className="relative w-full overflow-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div
                className="marquee-track"
                style={{
                  "--marquee-duration": `${Math.max(20, trustedCompanies.length * 5)}s`,
                } as React.CSSProperties}
              >
                {[...trustedCompanies, ...trustedCompanies].map((company, i) => {
                  const Tag = company.websiteUrl ? "a" : "span";
                  const linkProps = company.websiteUrl
                    ? { href: company.websiteUrl, target: "_blank" as const, rel: "noopener noreferrer" }
                    : {};
                  return (
                    <Tag
                      key={`${company.id}-${i}`}
                      {...linkProps}
                      className="group mx-8 flex shrink-0 items-center transition-all duration-300"
                    >
                      {company.logoUrl ? (
                        <Image
                          src={company.logoUrl}
                          alt={company.name}
                          width={120}
                          height={32}
                          className="h-8 w-auto object-contain opacity-40 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-muted-foreground/30 transition-colors duration-300 group-hover:text-muted-foreground/60">
                          {company.name}
                        </span>
                      )}
                    </Tag>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Auto-cycling testimonial card */}
          {currentTestimonial && (
            <div
              className="mt-10 flex justify-center"
              onMouseEnter={() => (isPaused.current = true)}
              onMouseLeave={() => (isPaused.current = false)}
            >
              <div
                className={`glass-heavy glass-shine h-52 w-full max-w-lg rounded-2xl p-6 ${isAnimating ? "card-animate-out" : "card-animate-in"}`}
                key={currentTestimonial.id}
              >
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${i < currentTestimonial.rating ? "text-accent-400" : "text-border"}`}
                    >
                      &#9733;
                    </span>
                  ))}
                </div>
                <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground italic">
                  &ldquo;{currentTestimonial.content}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  {currentTestimonial.avatarUrl ? (
                    <Image
                      src={currentTestimonial.avatarUrl}
                      alt={currentTestimonial.name}
                      width={36}
                      height={36}
                      unoptimized
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="glass flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-primary-600">
                      {currentTestimonial.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {currentTestimonial.name}
                    </p>
                    {(currentTestimonial.role || currentTestimonial.company) && (
                      <p className="text-xs text-muted-foreground">
                        {[currentTestimonial.role, currentTestimonial.company]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dot indicators */}
                {allTestimonials.length > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-1.5">
                    {allTestimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setIsAnimating(true);
                          setTimeout(() => {
                            setActiveIndex(i);
                            setIsAnimating(false);
                          }, 400);
                        }}
                        aria-label={`Show testimonial ${i + 1}`}
                        className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
                      >
                        <span
                          className={`block h-1.5 rounded-full transition-all duration-300 ${
                            i === activeIndex
                              ? "w-4 bg-primary-500"
                              : "w-1.5 bg-border hover:bg-muted-foreground/40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>}
      </Container>
    </section>
  );
}
