import Image from "next/image";
import type { Review } from "@/types/api";

interface ProductReviewsProps {
  reviews: Review[];
}

function getInitials(review: Review): string {
  const first = review.user.firstName?.[0] ?? "";
  const last = review.user.lastName?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

function getDisplayName(review: Review): string {
  const parts = [review.user.firstName, review.user.lastName].filter(Boolean);
  return parts.join(" ") || "Anonymous";
}

export function ProductReviews({ reviews }: ProductReviewsProps) {
  if (reviews.length === 0) {
    return (
      <div className="glass-card glass-shine rounded-xl p-5 text-center sm:rounded-2xl sm:p-8">
        <p className="text-sm text-muted-foreground">
          No reviews yet. Be the first to review this product!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground sm:text-lg">
        {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
      </h3>
      {reviews.map((review) => (
        <div
          key={review.id}
          className="glass-card glass-shine rounded-xl p-4 sm:rounded-2xl sm:p-6"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary-100 sm:h-10 sm:w-10">
              {review.user.avatarUrl ? (
                <Image
                  src={review.user.avatarUrl}
                  alt={getDisplayName(review)}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-primary-600 sm:text-sm">
                  {getInitials(review)}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-medium text-foreground">
                  {getDisplayName(review)}
                </span>
                {review.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 sm:text-xs">
                    <svg
                      className="h-3 w-3"
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
                    Verified Purchase
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Stars */}
              <div
                className="mt-1 flex"
                role="img"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className={`text-sm ${
                      i < review.rating ? "text-accent-400" : "text-border"
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
          </div>
        </div>
      ))}
    </div>
  );
}
