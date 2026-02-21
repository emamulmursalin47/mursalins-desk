"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/api";

export function ProductCard({ product }: { product: Product }) {
  const hasDiscount = product.salePrice !== null;
  const displayPrice = hasDiscount ? product.salePrice! : product.price;

  return (
    <div className="group relative block" data-animate>
      <div className="rounded-2xl transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-accent-500/10">
      <article className="glass-card flex h-104 flex-col overflow-hidden rounded-2xl p-1">
        {/* Thumbnail */}
        <div className="relative shrink-0 aspect-video overflow-hidden rounded-xl bg-muted">
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-linear-to-br from-accent-50 to-primary-50">
              <div className="h-12 w-12 rounded-xl bg-accent-200/60" />
            </div>
          )}

          {/* Price badge */}
          <div className="absolute top-3 right-3 glass rounded-lg px-2.5 py-1 backdrop-blur-sm">
            {hasDiscount && (
              <span className="mr-1.5 text-xs text-muted-foreground line-through">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
            <span className="text-sm font-bold text-foreground">
              ${Number(displayPrice).toFixed(2)}
            </span>
          </div>

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center rounded-full border border-primary-500/20 bg-primary-50/80 px-2.5 py-0.5 text-xs font-medium text-primary-600 backdrop-blur-sm">
              {product.productType?.name ?? "Other"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col px-4 py-3">
          <h3 className="text-base font-semibold leading-snug text-foreground line-clamp-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {/* Rating */}
          {product.totalReviews > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="flex" role="img" aria-label={`${Number(product.rating).toFixed(1)} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className={`text-xs ${
                      i < Math.round(Number(product.rating))
                        ? "text-accent-400"
                        : "text-border"
                    }`}
                  >
                    &#9733;
                  </span>
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground">
                ({product.totalReviews})
              </span>
            </div>
          )}

          {/* Tech tags */}
          {product.technologies.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.technologies.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="glass-subtle rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
              {product.technologies.length > 4 && (
                <span className="rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  +{product.technologies.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Action links — pinned to bottom */}
          <div className="mt-auto flex items-center gap-3 pt-2">
            {/* Stretched link: covers the entire card */}
            <Link
              href={`/store/${product.slug}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent-500 transition-colors group-hover:text-accent-600 after:absolute after:inset-0"
              aria-label={`View product: ${product.name}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              Details
            </Link>
            <Link
              href={`/store/${product.slug}/checkout`}
              className="relative z-10 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Buy
            </Link>
            {product.previewUrl && (
              <a
                href={product.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Preview
              </a>
            )}
          </div>
        </div>
      </article>
      </div>
    </div>
  );
}
