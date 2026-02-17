"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { adminGet, adminPost } from "@/lib/admin-api";

interface ReviewFormProps {
  productId: string;
}

type Eligibility =
  | { status: "loading" }
  | { status: "not-authenticated" }
  | { status: "eligible" }
  | { status: "ineligible"; reason: string }
  | { status: "submitted" }
  | { status: "error"; message: string };

export function ReviewForm({ productId }: ReviewFormProps) {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [eligibility, setEligibility] = useState<Eligibility>({
    status: "loading",
  });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const checkEligibility = useCallback(async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setEligibility({ status: "not-authenticated" });
      return;
    }
    try {
      const result = await adminGet<{ canReview: boolean; reason?: string }>(
        `/reviews/can-review/${productId}`,
      );
      if (result.canReview) {
        setEligibility({ status: "eligible" });
      } else {
        setEligibility({
          status: "ineligible",
          reason: result.reason ?? "You cannot review this product",
        });
      }
    } catch {
      setEligibility({
        status: "error",
        message: "Could not check review eligibility",
      });
    }
  }, [authLoading, isAuthenticated, productId]);

  useEffect(() => {
    checkEligibility();
  }, [checkEligibility]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await adminPost("/reviews", {
        productId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      });
      setEligibility({ status: "submitted" });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit review",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Not authenticated ─── */
  if (eligibility.status === "not-authenticated") {
    return (
      <div className="glass-card glass-shine rounded-xl p-5 text-center sm:rounded-2xl sm:p-8">
        <p className="text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-accent-500 hover:text-accent-600"
          >
            Sign in
          </Link>{" "}
          to leave a review.
        </p>
      </div>
    );
  }

  /* ─── Loading ─── */
  if (eligibility.status === "loading") {
    return null;
  }

  /* ─── Ineligible ─── */
  if (eligibility.status === "ineligible") {
    return (
      <div className="glass-card glass-shine rounded-xl p-5 text-center sm:rounded-2xl sm:p-8">
        <p className="text-sm text-muted-foreground">{eligibility.reason}</p>
      </div>
    );
  }

  /* ─── Already submitted ─── */
  if (eligibility.status === "submitted") {
    return (
      <div className="glass-card glass-shine rounded-xl p-5 text-center sm:rounded-2xl sm:p-8">
        <div className="mb-2 text-2xl">&#10003;</div>
        <p className="text-sm font-medium text-foreground">
          Review submitted!
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Your review is pending admin approval and will appear once approved.
        </p>
      </div>
    );
  }

  /* ─── Error checking eligibility ─── */
  if (eligibility.status === "error") {
    return (
      <div className="glass-card glass-shine rounded-xl p-5 text-center sm:rounded-2xl sm:p-8">
        <p className="text-sm text-muted-foreground">{eligibility.message}</p>
      </div>
    );
  }

  /* ─── Review Form ─── */
  return (
    <div className="glass-card glass-shine rounded-xl p-5 sm:rounded-2xl sm:p-8">
      <h3 className="mb-4 text-base font-semibold text-foreground sm:text-lg">
        Write a Review
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star picker */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground sm:text-sm">
            Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 rounded sm:text-3xl"
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <span
                  className={
                    star <= (hoverRating || rating)
                      ? "text-accent-400"
                      : "text-border"
                  }
                >
                  &#9733;
                </span>
              </button>
            ))}
          </div>
          {rating === 0 && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Click a star to rate
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="review-title"
            className="mb-1.5 block text-xs font-medium text-muted-foreground sm:text-sm"
          >
            Title{" "}
            <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            placeholder="Summarize your experience"
            className="w-full rounded-lg border border-glass-border bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 sm:rounded-xl sm:px-4 sm:py-2.5"
          />
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor="review-comment"
            className="mb-1.5 block text-xs font-medium text-muted-foreground sm:text-sm"
          >
            Review{" "}
            <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={5000}
            rows={4}
            placeholder="Share your thoughts about this product..."
            className="w-full rounded-lg border border-glass-border bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 sm:rounded-xl sm:px-4 sm:py-2.5"
          />
        </div>

        {submitError && (
          <p className="text-xs text-red-500">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={rating === 0 || submitting}
          className="btn-glass-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 sm:px-6 sm:py-3"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
