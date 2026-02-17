"use client";

import { useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import {
  gsap,
  SPRING_EASE,
  SPRING_DURATION,
  createFadeUp,
  createStaggerFadeUp,
} from "@/lib/gsap";
import type { Post, Category } from "@/types/api";
import { Container } from "@/components/layout/container";
import { BlogPostCard } from "./blog-post-card";
import { BlogFeaturedCard } from "./blog-featured-card";

interface BlogGridProps {
  posts: Post[];
  featuredPost: Post | null;
  categories: Category[];
  meta: { total: number; page: number; totalPages: number } | null;
  activeCategory: string | null;
}

export function BlogGrid({
  posts,
  featuredPost,
  categories,
  meta,
  activeCategory,
}: BlogGridProps) {
  const filterRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const pillWave1Ref = useRef<HTMLSpanElement>(null);
  const pillWave2Ref = useRef<HTMLSpanElement>(null);
  const isFirstPill = useRef(true);
  const featuredRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const updatePill = useCallback(() => {
    if (!filterRef.current || !pillRef.current) return;
    const activeEl = filterRef.current.querySelector<HTMLElement>(
      "[data-filter-active='true']",
    );
    if (!activeEl) return;

    const { offsetLeft: x, offsetTop: y, offsetWidth: width, offsetHeight: height } = activeEl;

    if (isFirstPill.current) {
      gsap.set(pillRef.current, { x, y, width, height, opacity: 1 });
      isFirstPill.current = false;
    } else {
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

      // Water slosh
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
  }, [activeCategory, updatePill]);

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
    if (filterRef.current) {
      createFadeUp(filterRef.current, { scrollTrigger: false, delay: 0.2 });
    }
    if (featuredRef.current) {
      createFadeUp(featuredRef.current, { scrollTrigger: false, delay: 0.3 });
    }
    if (gridRef.current) {
      createStaggerFadeUp(gridRef.current, "[data-animate]", {
        scrollTrigger: false,
        delay: 0.4,
      });
    }
    updatePill();
  });

  const currentPage = meta?.page ?? 1;
  const totalPages = meta?.totalPages ?? 1;

  function buildUrl(page: number, category?: string | null) {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (category) params.set("category", category);
    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  }

  return (
    <section className="pb-24">
      <Container>
        {/* Category filter pills */}
        <div
          ref={filterRef}
          className="relative mb-10 flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          {/* Sliding pill */}
          <span
            ref={pillRef}
            className="pointer-events-none absolute left-0 top-0 will-change-transform rounded-full nav-pill-liquid"
            style={{ opacity: 0 }}
            aria-hidden="true"
          >
            <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
              <span ref={pillWave1Ref} className="nav-pill-wave-1" />
              <span ref={pillWave2Ref} className="nav-pill-wave-2" />
            </span>
            <span className="absolute inset-0 rounded-full pointer-events-none nav-pill-highlight" />
          </span>

          <Link
            href="/blog"
            data-filter-active={!activeCategory ? "true" : "false"}
            className={`relative z-10 shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${
              !activeCategory
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={buildUrl(1, cat.slug)}
              data-filter-active={activeCategory === cat.slug ? "true" : "false"}
              className={`relative z-10 shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${
                activeCategory === cat.slug
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Featured post */}
        {featuredPost && (
          <div ref={featuredRef} className="mb-10">
            <BlogFeaturedCard post={featuredPost} />
          </div>
        )}

        {/* Post grid */}
        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-semibold text-foreground">
              No posts found
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try selecting a different category or check back later.
            </p>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            {currentPage > 1 && (
              <Link
                href={buildUrl(currentPage - 1, activeCategory)}
                className="glass glass-shine rounded-xl px-5 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                &larr; Previous
              </Link>
            )}
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={buildUrl(currentPage + 1, activeCategory)}
                className="glass glass-shine rounded-xl px-5 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
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
