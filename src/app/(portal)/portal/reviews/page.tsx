"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminPatch } from "@/lib/admin-api";
import { EmptyState } from "@/components/portal/empty-state";
import { Pagination } from "@/components/dashboard/pagination";
import type { PendingReview, PaginatedResult } from "@/types/api";

function getDisplayName(review: PendingReview): string {
  const parts = [review.user.firstName, review.user.lastName].filter(Boolean);
  return parts.join(" ") || "Anonymous";
}

export default function MyReviewsPage() {
  const [data, setData] = useState<PaginatedResult<PendingReview> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ─── Edit modal state ─── */
  const [editingReview, setEditingReview] = useState<PendingReview | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editTitle, setEditTitle] = useState("");
  const [editComment, setEditComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminGet<PaginatedResult<PendingReview>>(
        `/reviews/mine?page=${page}&limit=12`,
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

  function openEdit(review: PendingReview) {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditTitle(review.title ?? "");
    setEditComment(review.comment ?? "");
    setSaveError(null);
  }

  function closeEdit() {
    setEditingReview(null);
    setEditRating(0);
    setEditHoverRating(0);
    setEditTitle("");
    setEditComment("");
    setSaveError(null);
  }

  async function handleSave() {
    if (!editingReview || editRating === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      await adminPatch(`/reviews/${editingReview.id}`, {
        rating: editRating,
        title: editTitle.trim() || undefined,
        comment: editComment.trim() || undefined,
      });
      // Update local state
      setData((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((r) =>
                r.id === editingReview.id
                  ? {
                      ...r,
                      rating: editRating,
                      title: editTitle.trim() || null,
                      comment: editComment.trim() || null,
                    }
                  : r,
              ),
            }
          : null,
      );
      closeEdit();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to update review",
      );
    } finally {
      setSaving(false);
    }
  }

  const reviews = data?.data ?? [];

  return (
    <div ref={containerRef}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your product reviews and their approval status.
        </p>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass animate-pulse rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted/60" />
                  <div className="h-4 w-32 rounded bg-muted/60" />
                </div>
                <div className="mt-3 flex gap-1">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-4 w-4 rounded bg-muted/40" />
                  ))}
                </div>
                <div className="mt-3 h-3 w-48 rounded bg-muted/40" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div data-animate>
            <EmptyState message="You haven't reviewed any products yet." />
            <div className="mt-4 text-center">
              <Link
                href="/store"
                className="text-sm font-medium text-accent-500 transition-colors hover:text-accent-600"
              >
                Browse the store &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  data-animate
                  className="glass glass-shine rounded-2xl p-5"
                >
                  {/* Product info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {review.product.thumbnailUrl && (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={review.product.thumbnailUrl}
                            alt={review.product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/store/${review.product.slug}`}
                          className="text-sm font-semibold text-primary-600 transition-colors hover:text-primary-500"
                        >
                          {review.product.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric", year: "numeric" },
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Status + Edit */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          review.isApproved
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            review.isApproved ? "bg-success" : "bg-warning"
                          }`}
                        />
                        {review.isApproved ? "Approved" : "Pending"}
                      </span>
                      <button
                        onClick={() => openEdit(review)}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Edit review"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Stars */}
                  <div
                    className="mt-2 flex"
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

                  {/* Title + Comment */}
                  {review.title && (
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {review.title}
                    </p>
                  )}
                  {review.comment && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {data?.meta && data.meta.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  page={data.meta.page}
                  totalPages={data.meta.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass w-full max-w-md rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Edit Review
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {editingReview.product.name}
            </p>

            <div className="mt-5 space-y-4">
              {/* Star picker */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      onMouseEnter={() => setEditHoverRating(star)}
                      onMouseLeave={() => setEditHoverRating(0)}
                      className="text-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 rounded"
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      <span
                        className={
                          star <= (editHoverRating || editRating)
                            ? "text-accent-400"
                            : "text-border"
                        }
                      >
                        &#9733;
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="edit-review-title"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Title{" "}
                  <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <input
                  id="edit-review-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={255}
                  placeholder="Summarize your experience"
                  className="glass w-full rounded-xl border-0 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>

              {/* Comment */}
              <div>
                <label
                  htmlFor="edit-review-comment"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Review{" "}
                  <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <textarea
                  id="edit-review-comment"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  maxLength={5000}
                  rows={4}
                  placeholder="Share your thoughts about this product..."
                  className="glass w-full rounded-xl border-0 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>

              {saveError && (
                <p className="text-xs text-destructive">{saveError}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeEdit}
                className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={editRating === 0 || saving}
                className="rounded-xl bg-accent-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-600 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
