"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminPatch } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { LoadingState } from "@/components/dashboard/loading-state";
import { Pagination } from "@/components/dashboard/pagination";
import type { PendingReview } from "@/types/api";
import type { PaginatedResult } from "@/types/api";

function getDisplayName(review: PendingReview): string {
  const parts = [review.user.firstName, review.user.lastName].filter(Boolean);
  return parts.join(" ") || "Anonymous";
}

export default function ReviewsPage() {
  const [data, setData] = useState<PaginatedResult<PendingReview> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminGet<PaginatedResult<PendingReview>>(
        `/reviews/admin/pending?page=${page}&limit=20`,
      );
      setData(result);
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useGSAP(
    () => {
      if (loading || !containerRef.current) return;
      const items = containerRef.current.querySelectorAll("[data-animate]");
      if (items.length === 0) return;
      gsap.from(items, {
        opacity: 0,
        y: 24,
        duration: DURATION_ENTRY,
        stagger: STAGGER_DELAY,
        ease: GSAP_EASE,
        onComplete() {
          gsap.set(items, { clearProps: "transform,opacity" });
        },
      });
    },
    { dependencies: [loading], scope: containerRef },
  );

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      await adminPatch(`/reviews/${id}/${action}`);
      setData((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.filter((r) => r.id !== id),
              meta: { ...prev.meta, total: prev.meta.total - 1 },
            }
          : null,
      );
    } catch {
      /* */
    } finally {
      setActionLoading(null);
    }
  };

  const reviews = data?.data ?? [];

  return (
    <div ref={containerRef}>
      <PageHeader
        title="Reviews"
        description="Approve or reject pending customer reviews."
      />

      {loading ? (
        <LoadingState />
      ) : reviews.length === 0 ? (
        <div
          data-animate
          className="glass glass-shine rounded-xl p-8 text-center sm:rounded-2xl"
        >
          <p className="text-sm text-muted-foreground">
            No pending reviews. All caught up!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              data-animate
              className="glass glass-shine rounded-xl p-4 sm:rounded-2xl sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Left: review content */}
                <div className="min-w-0 flex-1 space-y-2">
                  {/* Product info */}
                  <div className="flex items-center gap-2">
                    {review.product.thumbnailUrl && (
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={review.product.thumbnailUrl}
                          alt={review.product.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {review.product.name}
                    </span>
                  </div>

                  {/* Reviewer + rating */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-xs text-muted-foreground">
                      by {getDisplayName(review)}
                    </span>
                    <div
                      className="flex"
                      role="img"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          aria-hidden="true"
                          className={`text-sm ${
                            i < review.rating
                              ? "text-accent-400"
                              : "text-border"
                          }`}
                        >
                          &#9733;
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Title + comment */}
                  {review.title && (
                    <p className="text-sm font-medium text-foreground">
                      {review.title}
                    </p>
                  )}
                  {review.comment && (
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {review.comment}
                    </p>
                  )}
                </div>

                {/* Right: action buttons */}
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleAction(review.id, "approve")}
                    disabled={actionLoading === review.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-100 disabled:opacity-50 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                  >
                    <svg
                      className="h-3.5 w-3.5"
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
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(review.id, "reject")}
                    disabled={actionLoading === review.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}

          {data?.meta && data.meta.totalPages > 1 && (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
