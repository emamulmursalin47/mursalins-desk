"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import {
  createFadeUp,
  createStaggerFadeUp,
  createFadeIn,
} from "@/lib/gsap";
import type { Product, LicenseType, Review } from "@/types/api";
import { Container } from "@/components/layout/container";
import { ProductCard } from "./product-card";
import { ProductReviews } from "./product-reviews";
import { ReviewForm } from "./review-form";

/* ─── Config ─── */

const licenseLabels: Record<LicenseType, string> = {
  PERSONAL: "Personal License",
  COMMERCIAL: "Commercial License",
  EXTENDED: "Extended License",
};

const licenseDetails: Record<LicenseType, { features: string[] }> = {
  PERSONAL: {
    features: [
      "Use in 1 personal project",
      "No commercial use",
      "No resale or redistribution",
      "Free updates included",
    ],
  },
  COMMERCIAL: {
    features: [
      "Use in unlimited commercial projects",
      "Client projects allowed",
      "No resale or redistribution",
      "Free updates included",
      "Priority support",
    ],
  },
  EXTENDED: {
    features: [
      "Use in unlimited projects",
      "Resale in end products allowed",
      "SaaS / subscription use allowed",
      "Free lifetime updates",
      "Priority support",
      "Source files included",
    ],
  },
};

/* ─── Helpers ─── */

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

/* ─── Component ─── */

interface ProductDetailViewProps {
  product: Product;
  relatedProducts?: Product[];
  reviews?: Review[];
}

export function ProductDetailView({
  product,
  relatedProducts = [],
  reviews = [],
}: ProductDetailViewProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const licenseRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const whatsIncludedRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);
  const versionRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const hasDiscount = product.salePrice !== null;
  const displayPrice = hasDiscount ? product.salePrice! : product.price;
  const hasFeatures = product.features && product.features.length > 0;
  const hasImages = product.images && product.images.length > 0;
  const hasLinks = product.previewUrl;
  const license = licenseDetails[product.licenseType];
  const hasWhatsIncluded = product.whatsIncluded && product.whatsIncluded.length > 0;
  const hasVideo = product.videoUrl ? !!getEmbedUrl(product.videoUrl) : false;
  const hasVersion = !!product.version;
  const hasExternalLinks = product.supportUrl || product.documentationUrl;

  useGSAP(() => {
    if (heroRef.current) {
      createFadeUp(heroRef.current, {
        y: 30,
        duration: 0.8,
        scrollTrigger: false,
      });
    }
    if (headerRef.current) {
      createStaggerFadeUp(headerRef.current, "[data-animate]", {
        scrollTrigger: false,
        delay: 0.3,
      });
    }
    if (galleryRef.current) {
      createStaggerFadeUp(galleryRef.current, "[data-animate]");
    }
    if (videoRef.current) {
      createFadeUp(videoRef.current);
    }
    if (licenseRef.current) {
      createFadeUp(licenseRef.current);
    }
    if (descriptionRef.current) {
      createFadeUp(descriptionRef.current);
    }
    if (whatsIncludedRef.current) {
      createStaggerFadeUp(whatsIncludedRef.current, "[data-animate]");
    }
    if (featuresRef.current) {
      createStaggerFadeUp(featuresRef.current, "[data-animate]");
    }
    if (techRef.current) {
      createStaggerFadeUp(techRef.current, "[data-animate]");
    }
    if (versionRef.current) {
      createFadeUp(versionRef.current);
    }
    if (linksRef.current) {
      createFadeUp(linksRef.current);
    }
    if (reviewsRef.current) {
      createFadeUp(reviewsRef.current);
    }
    if (ctaRef.current) {
      createFadeUp(ctaRef.current);
    }
    if (relatedRef.current) {
      createStaggerFadeUp(relatedRef.current, "[data-animate]");
    }
    if (backRef.current) {
      createFadeIn(backRef.current, { delay: 0.2 });
    }
  });

  return (
    <>
      {/* ── 1. Hero Image ── */}
      {product.thumbnailUrl && (
        <section className="relative overflow-hidden pt-20 pb-2 sm:pt-24 sm:pb-4">
          <Container>
            <div
              ref={heroRef}
              data-gsap
              className="relative overflow-hidden rounded-2xl bg-muted aspect-video sm:rounded-3xl sm:aspect-21/9"
            >
              <Image
                src={product.thumbnailUrl}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
              />
            </div>
          </Container>
        </section>
      )}

      {/* ── 2. Header ── */}
      <section className={product.thumbnailUrl ? "py-8 sm:py-12" : "pt-24 pb-8 sm:pt-32 sm:pb-12"}>
        <Container>
          <div ref={headerRef} data-gsap className="space-y-3 sm:space-y-4">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2" data-animate>
              <span className="inline-flex items-center rounded-full border border-primary-500/20 bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600 sm:px-3 sm:py-1 sm:text-sm">
                {product.productType?.name ?? "Other"}
              </span>
              <span className="inline-flex items-center rounded-full border border-foreground/10 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:px-3 sm:py-1 sm:text-sm">
                {licenseLabels[product.licenseType]}
              </span>
              {hasDiscount && (
                <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600 sm:px-3 sm:py-1 sm:text-sm">
                  Sale
                </span>
              )}
              {product.version && (
                <span className="inline-flex items-center rounded-full border border-primary-500/20 bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600 sm:px-3 sm:py-1 sm:text-sm">
                  v{product.version}
                </span>
              )}
            </div>

            {/* Name */}
            <h1
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
              data-animate
            >
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3" data-animate>
              <span className="text-2xl font-bold text-accent-500 sm:text-3xl">
                ${Number(displayPrice).toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through sm:text-xl">
                  ${Number(product.price).toFixed(2)}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                {product.currency}
              </span>
            </div>

            {/* Short description */}
            {product.description && (
              <p
                className="text-sm leading-relaxed text-justify text-muted-foreground sm:text-base"
                data-animate
              >
                {product.description}
              </p>
            )}

            {/* Meta row */}
            <div
              className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground sm:gap-x-6 sm:gap-y-2 sm:text-sm"
              data-animate
            >
              {product.totalReviews > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="flex" role="img" aria-label={`${Number(product.rating).toFixed(1)} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        aria-hidden="true"
                        className={`text-sm ${
                          i < Math.round(Number(product.rating))
                            ? "text-accent-400"
                            : "text-border"
                        }`}
                      >
                        &#9733;
                      </span>
                    ))}
                  </div>
                  <span>
                    {Number(product.rating).toFixed(1)} ({product.totalReviews}{" "}
                    {product.totalReviews === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
              {product.downloadCount > 0 && (
                <div>
                  <span className="font-medium text-foreground">Downloads:</span>{" "}
                  {product.downloadCount.toLocaleString()}
                </div>
              )}
              <div>
                <span className="font-medium text-foreground">Format:</span>{" "}
                Digital download
              </div>
              {product.publishedAt && (
                <div>
                  <span className="font-medium text-foreground">Published:</span>{" "}
                  {new Date(product.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ── 3. Gallery / Screenshots ── */}
      {hasImages && (
        <section className="py-8 sm:py-12">
          <Container>
            <h2 className="mb-5 text-lg font-bold text-foreground sm:mb-8 sm:text-xl">
              Screenshots
            </h2>
            <div
              ref={galleryRef}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
            >
              {product.images.map((imageUrl, i) => (
                <div
                  key={i}
                  className="glass-card glass-shine group overflow-hidden rounded-xl p-1 sm:rounded-2xl"
                  data-animate
                >
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-muted sm:rounded-xl">
                    <Image
                      src={imageUrl}
                      alt={`${product.name} screenshot ${i + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── 4. Video Demo ── */}
      {hasVideo && (
        <section className="py-8 sm:py-12">
          <Container>
            <div ref={videoRef} data-gsap>
              <h2 className="mb-4 text-lg font-bold text-foreground sm:mb-6 sm:text-xl">
                Demo Video
              </h2>
              <div className="glass-card glass-shine overflow-hidden rounded-xl sm:rounded-2xl">
                <div className="relative aspect-video">
                  <iframe
                    src={getEmbedUrl(product.videoUrl!)!}
                    title={`${product.name} demo video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── 5. License Details ── */}
      <section className="py-8 sm:py-12">
        <Container>
          <div
            ref={licenseRef}
            data-gsap
            className="glass-card glass-shine rounded-xl border-l-4 border-l-accent-500 p-5 sm:rounded-2xl sm:p-8"
          >
            <h2 className="mb-3 text-lg font-bold text-foreground sm:mb-4 sm:text-xl">
              {licenseLabels[product.licenseType]}
            </h2>
            <ul className="space-y-2">
              {license.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent-500 sm:h-5 sm:w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs text-muted-foreground sm:text-sm">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* ── 6. Long Description ── */}
      {product.longDescription && (
        <section className="py-8 sm:py-12">
          <Container>
            <div
              ref={descriptionRef}
              data-gsap
              className="glass-card glass-shine rounded-xl p-5 sm:rounded-2xl sm:p-8"
            >
              <h2 className="mb-3 text-lg font-bold text-foreground sm:mb-4 sm:text-xl">
                About This Product
              </h2>
              <div className="text-sm leading-relaxed text-justify text-muted-foreground whitespace-pre-line sm:text-base">
                {product.longDescription}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── 7. What's Included ── */}
      {hasWhatsIncluded && (
        <section className="py-8 sm:py-12">
          <Container>
            <h2 className="mb-4 text-lg font-bold text-foreground sm:mb-6 sm:text-xl">
              What&apos;s Included
            </h2>
            <div
              ref={whatsIncludedRef}
              className="glass-card glass-shine rounded-xl p-5 sm:rounded-2xl sm:p-8"
            >
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                {product.whatsIncluded.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 sm:gap-3"
                    data-animate
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary-500 sm:h-5 sm:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs text-foreground sm:text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── 8. Key Features ── */}
      {hasFeatures && (
        <section className="py-8 sm:py-12">
          <Container>
            <h2 className="mb-4 text-lg font-bold text-foreground sm:mb-6 sm:text-xl">
              Features
            </h2>
            <div
              ref={featuresRef}
              className="glass-card glass-shine rounded-xl p-5 sm:rounded-2xl sm:p-8"
            >
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                {product.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 sm:gap-3"
                    data-animate
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500 sm:h-5 sm:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-xs text-foreground sm:text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── 9. Built With ── */}
      {product.technologies.length > 0 && (
        <section className="py-8 sm:py-12">
          <Container>
            <div ref={techRef}>
              <h2
                className="mb-4 text-lg font-bold text-foreground sm:mb-6 sm:text-xl"
                data-animate
              >
                Built With
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-3" data-animate>
                {product.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="glass-card glass-shine rounded-lg px-3 py-1.5 text-xs font-medium text-foreground sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── 10. Version & Changelog ── */}
      {hasVersion && (
        <section className="py-8 sm:py-12">
          <Container>
            <div
              ref={versionRef}
              data-gsap
              className="glass-card glass-shine rounded-xl p-5 sm:rounded-2xl sm:p-8"
            >
              <div className="mb-3 flex items-center gap-3 sm:mb-4">
                <h2 className="text-lg font-bold text-foreground sm:text-xl">
                  Version History
                </h2>
                <span className="inline-flex items-center rounded-full border border-primary-500/20 bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600">
                  v{product.version}
                </span>
              </div>
              {product.changelog && (
                <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line sm:text-base">
                  {product.changelog}
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ── 11. Support & Documentation ── */}
      {hasExternalLinks && (
        <section className="py-8 sm:py-12">
          <Container>
            <div ref={linksRef} data-gsap className="flex flex-wrap gap-3 sm:gap-4">
              {product.documentationUrl && (
                <a
                  href={product.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card glass-shine inline-flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 sm:rounded-2xl sm:px-6 sm:py-4"
                >
                  <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  Documentation
                </a>
              )}
              {product.supportUrl && (
                <a
                  href={product.supportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card glass-shine inline-flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 sm:rounded-2xl sm:px-6 sm:py-4"
                >
                  <svg className="h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                  Get Support
                </a>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ── 12. Reviews ── */}
      <section id="reviews" className="py-8 sm:py-12 scroll-mt-24">
        <Container>
          <div ref={reviewsRef} data-gsap className="space-y-6">
            {reviews.length > 0 && (
              <div className="glass-card glass-shine rounded-xl p-5 sm:rounded-2xl sm:p-8">
                <h2 className="mb-4 text-lg font-bold text-foreground sm:text-xl">
                  Customer Reviews
                </h2>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground sm:text-5xl">
                      {Number(product.rating).toFixed(1)}
                    </div>
                    <div className="mt-1 flex justify-center" role="img" aria-label={`${Number(product.rating).toFixed(1)} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          aria-hidden="true"
                          className={`text-lg ${
                            i < Math.round(Number(product.rating))
                              ? "text-accent-400"
                              : "text-border"
                          }`}
                        >
                          &#9733;
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      Based on {reviews.length}{" "}
                      {reviews.length === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                  <div className="flex-1 w-full space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => r.rating === star).length;
                      const pct = Math.round((count / reviews.length) * 100);
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="w-3 text-xs text-muted-foreground">{star}</span>
                          <svg className="h-3 w-3 shrink-0 text-accent-400" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-border/30">
                            <div
                              className="h-full rounded-full bg-accent-400 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-[11px] text-muted-foreground">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <ProductReviews reviews={reviews} />
            <ReviewForm productId={product.id} />
          </div>
        </Container>
      </section>

      {/* ── 13. CTA ── */}
      <section className="py-10 sm:py-16">
        <Container>
          <div
            ref={ctaRef}
            data-gsap
            className="glass-card glass-shine rounded-2xl p-6 text-center sm:rounded-3xl sm:p-8"
          >
            <h2 className="mb-2 text-lg font-bold text-foreground sm:text-xl">
              Get {product.name}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground sm:text-base">
              {licenseLabels[product.licenseType]} — ${Number(displayPrice).toFixed(2)} {product.currency}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
              <Link
                href={`/store/${product.slug}/checkout`}
                className="btn-glass-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 sm:px-6 sm:py-3"
              >
                Purchase — ${Number(displayPrice).toFixed(2)}
              </Link>
              {hasLinks && (
                <a
                  href={product.previewUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glass-secondary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 sm:px-6 sm:py-3"
                >
                  Live Preview &rarr;
                </a>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ── 14. Related Products ── */}
      {relatedProducts.length > 0 && (
        <section className="bg-muted/30 py-10 sm:py-16">
          <Container>
            <h2 className="mb-6 text-center text-lg font-bold text-foreground sm:mb-8 sm:text-xl">
              Related Products
            </h2>
            <div
              ref={relatedRef}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
            >
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── 15. Back link ── */}
      <section className="py-8 sm:py-12">
        <Container>
          <div ref={backRef} data-gsap className="text-center">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent-500 transition-colors hover:text-accent-600"
            >
              <span className="transition-transform hover:-translate-x-1">
                &larr;
              </span>
              Back to Store
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
