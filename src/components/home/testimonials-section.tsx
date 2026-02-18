"use client";

import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, createFadeUp } from "@/lib/gsap";
import type { Testimonial } from "@/types/api";
import { Container } from "@/components/layout/container";

const AUTO_PLAY_INTERVAL = 5000;

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  const headingRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);

  const totalPages = Math.ceil(testimonials.length / cardsPerPage);

  // Responsive cards-per-page
  useEffect(() => {
    function updateCardsPerPage() {
      if (window.innerWidth < 640) {
        setCardsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerPage(2);
      } else {
        setCardsPerPage(3);
      }
    }
    updateCardsPerPage();
    window.addEventListener("resize", updateCardsPerPage);
    return () => window.removeEventListener("resize", updateCardsPerPage);
  }, []);

  // Reset page when cardsPerPage changes to avoid out-of-bounds
  useEffect(() => {
    setCurrentPage(0);
  }, [cardsPerPage]);

  // Slide track to current page
  useGSAP(() => {
    if (!trackRef.current) return;
    gsap.to(trackRef.current, {
      xPercent: -currentPage * 100,
      duration: 0.6,
      ease: "power2.out",
      force3D: true,
    });
  }, { dependencies: [currentPage] });

  const goToPage = useCallback(
    (page: number) => {
      const pages = Math.ceil(testimonials.length / cardsPerPage);
      setCurrentPage(((page % pages) + pages) % pages);
    },
    [testimonials.length, cardsPerPage],
  );

  // Auto-rotation
  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(() => {
      if (!isPaused.current) {
        setCurrentPage((prev) => (prev + 1) % totalPages);
      }
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [totalPages]);

  // Entrance animation
  useGSAP(() => {
    if (headingRef.current) {
      createFadeUp(headingRef.current, { y: 20, duration: 0.5 });
    }
  });

  if (testimonials.length === 0) return null;

  return (
    <section
      className="relative py-16"
      onMouseEnter={() => (isPaused.current = true)}
      onMouseLeave={() => (isPaused.current = false)}
    >
      <Container>
        <div ref={headingRef} data-gsap className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What People Say
          </h2>
          <p className="mt-3 text-muted-foreground">
            Feedback from clients and collaborators
          </p>
        </div>

        {/* Carousel viewport */}
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex will-change-transform"
            style={{ width: "100%" }}
          >
            {/* Render pages */}
            {Array.from({ length: totalPages }).map((_, pageIndex) => (
              <div
                key={pageIndex}
                className="flex w-full shrink-0 gap-5 px-1"
              >
                {testimonials
                  .slice(
                    pageIndex * cardsPerPage,
                    pageIndex * cardsPerPage + cardsPerPage,
                  )
                  .map((testimonial) => (
                    <TestimonialCard
                      key={testimonial.id}
                      testimonial={testimonial}
                      cardsPerPage={cardsPerPage}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation dots */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                aria-label={`Go to page ${i + 1}`}
                className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
              >
                <span
                  className={`block h-2 rounded-full transition-all duration-300 ${
                    i === currentPage
                      ? "w-6 bg-primary-500"
                      : "w-2 bg-border hover:bg-muted-foreground/40"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function TestimonialCard({
  testimonial,
  cardsPerPage,
}: {
  testimonial: Testimonial;
  cardsPerPage: number;
}) {
  return (
    <div
      className="group/lift"
      style={{ flex: `0 0 calc((100% - ${(cardsPerPage - 1) * 20}px) / ${cardsPerPage})` }}
    >
    <article
      className="glass-card glass-shine flex h-full w-full flex-col rounded-2xl p-6 transition-[transform,box-shadow] duration-300 ease-out group-hover/lift:-translate-y-1 group-hover/lift:shadow-xl group-hover/lift:shadow-primary-500/8"
    >
      {/* Stars */}
      <div className="mb-4 flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`text-sm ${
              i < testimonial.rating ? "text-accent-400" : "text-border"
            }`}
          >
            &#9733;
          </span>
        ))}
      </div>

      {/* Quote */}
      <p className="flex-1 text-sm leading-relaxed text-foreground">
        &ldquo;{testimonial.content}&rdquo;
      </p>

      {/* Author */}
      <div className="mt-5 flex items-center gap-3">
        {testimonial.avatarUrl ? (
          <Image
            src={testimonial.avatarUrl}
            alt={testimonial.name}
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="glass-subtle flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-500">
            {testimonial.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-foreground">
            {testimonial.name}
          </p>
          {(testimonial.role || testimonial.company) && (
            <p className="text-xs text-muted-foreground">
              {[testimonial.role, testimonial.company]
                .filter(Boolean)
                .join(" at ")}
            </p>
          )}
        </div>
      </div>
    </article>
    </div>
  );
}
