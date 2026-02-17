"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminPatch, adminDelete, revalidateCache } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useToast } from "@/components/dashboard/toast-context";
import type { AdminTestimonial } from "@/types/admin";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-1 text-lg text-accent-500">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function TestimonialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [testimonial, setTestimonial] = useState<AdminTestimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    adminGet<AdminTestimonial>(`/testimonials/${id}`)
      .then(setTestimonial)
      .catch(() => router.push("/dashboard/testimonials"))
      .finally(() => setLoading(false));
  }, [id, router]);

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
        onComplete() { gsap.set(items, { clearProps: "transform,opacity" }); },
      });
    },
    { dependencies: [loading], scope: containerRef },
  );

  async function updateTestimonial(data: Record<string, unknown>) {
    setUpdating(true);
    try {
      const updated = await adminPatch<AdminTestimonial>(
        `/testimonials/${id}`,
        data,
      );
      setTestimonial(updated);
      await revalidateCache("testimonials");
      toast("Testimonial updated", "success");
    } catch {
      toast("Failed to update", "error");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await adminDelete(`/testimonials/${id}`);
      await revalidateCache("testimonials");
      toast("Testimonial deleted", "success");
      router.push("/dashboard/testimonials");
    } catch {
      toast("Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!testimonial) return null;

  return (
    <div ref={containerRef}>
      <PageHeader
        title="Testimonial Details"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/dashboard/testimonials")}
              className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium"
            >
              &larr; Back
            </button>
            <Link
              href={`/dashboard/testimonials/${id}/edit`}
              className="btn-glass-primary rounded-xl px-4 py-2 text-sm font-semibold text-white"
            >
              Edit
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Testimonial Content */}
        <div data-animate className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <StatusBadge status={testimonial.status} />
            {testimonial.isFeatured && (
              <span className="inline-flex items-center rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-medium text-accent-700">
                Featured
              </span>
            )}
          </div>

          <StarRating rating={testimonial.rating} />

          <blockquote className="mt-4 text-base leading-relaxed text-foreground">
            &ldquo;{testimonial.content}&rdquo;
          </blockquote>

          {/* Author info */}
          <div className="mt-6 flex items-center gap-4 border-t border-foreground/5 pt-5">
            {testimonial.avatarUrl ? (
              <img
                src={testimonial.avatarUrl}
                alt={testimonial.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                {testimonial.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-semibold text-foreground">
                {testimonial.name}
              </div>
              {(testimonial.role || testimonial.company) && (
                <div className="text-sm text-muted-foreground">
                  {[testimonial.role, testimonial.company]
                    .filter(Boolean)
                    .join(" at ")}
                </div>
              )}
            </div>
          </div>

          {testimonial.project && (
            <div className="mt-4 text-sm text-muted-foreground">
              Related project:{" "}
              <span className="font-medium text-foreground">
                {testimonial.project.title}
              </span>
            </div>
          )}
        </div>

        {/* Info & Actions Sidebar */}
        <div data-animate className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Details
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Name</dt>
                <dd className="font-medium text-foreground">
                  {testimonial.name}
                </dd>
              </div>
              {testimonial.role && (
                <div>
                  <dt className="text-xs text-muted-foreground">Role</dt>
                  <dd className="font-medium text-foreground">
                    {testimonial.role}
                  </dd>
                </div>
              )}
              {testimonial.company && (
                <div>
                  <dt className="text-xs text-muted-foreground">Company</dt>
                  <dd className="font-medium text-foreground">
                    {testimonial.company}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-muted-foreground">Rating</dt>
                <dd className="font-medium text-foreground">
                  {testimonial.rating} / 5
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Sort Order</dt>
                <dd className="font-medium text-foreground">
                  {testimonial.sortOrder}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Submitted</dt>
                <dd className="font-medium text-foreground">
                  {new Date(testimonial.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Actions
            </h3>
            <div className="flex flex-col gap-2">
              {testimonial.status !== "APPROVED" && (
                <button
                  onClick={() => updateTestimonial({ approved: true })}
                  disabled={updating}
                  className="btn-glass-primary w-full rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Approve
                </button>
              )}
              {testimonial.status !== "REJECTED" && (
                <button
                  onClick={() => updateTestimonial({ approved: false })}
                  disabled={updating}
                  className="w-full rounded-xl border border-warning/30 px-4 py-2 text-sm font-medium text-warning transition-colors hover:bg-warning/10 disabled:opacity-50"
                >
                  Reject
                </button>
              )}
              <button
                onClick={() =>
                  updateTestimonial({ featured: !testimonial.isFeatured })
                }
                disabled={updating}
                className="btn-glass-secondary w-full rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {testimonial.isFeatured
                  ? "Remove from Featured"
                  : "Mark as Featured"}
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="w-full rounded-xl border border-destructive/20 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
