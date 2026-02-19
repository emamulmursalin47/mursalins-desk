"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminPost, adminPatch, revalidateCache } from "@/lib/admin-api";
import { useToast } from "@/components/dashboard/toast-context";
import { ImageUpload } from "@/components/dashboard/image-upload";
import type { AdminTestimonial, TestimonialStatus } from "@/types/admin";

interface TestimonialFormProps {
  testimonial?: AdminTestimonial;
}

export function TestimonialForm({ testimonial }: TestimonialFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!testimonial;

  const [name, setName] = useState(testimonial?.name ?? "");
  const [role, setRole] = useState(testimonial?.role ?? "");
  const [company, setCompany] = useState(testimonial?.company ?? "");
  const [content, setContent] = useState(testimonial?.content ?? "");
  const [rating, setRating] = useState(testimonial?.rating ?? 5);
  const [avatarUrl, setAvatarUrl] = useState(testimonial?.avatarUrl ?? "");
  const [status, setStatus] = useState<TestimonialStatus>(
    testimonial?.status ?? "APPROVED",
  );
  const [isFeatured, setIsFeatured] = useState(
    testimonial?.isFeatured ?? false,
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast("Name and content are required", "error");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        content: content.trim(),
        rating,
        role: role.trim() || undefined,
        company: company.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        status,
        isFeatured,
      };

      if (isEdit) {
        await adminPatch(`/testimonials/${testimonial.id}`, body);
        toast("Testimonial updated", "success");
      } else {
        await adminPost("/testimonials", body);
        toast("Testimonial created", "success");
      }
      await revalidateCache("testimonials");
      router.push("/dashboard/testimonials");
    } catch {
      toast(isEdit ? "Failed to update" : "Failed to create", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-5 lg:col-span-2">
          <div className="glass rounded-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Testimonial Content
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  required
                  className="glass-subtle w-full rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="What did the client say..."
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {content.length}/2000
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Rating *
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-colors ${
                        star <= rating
                          ? "text-accent-500"
                          : "text-foreground/15"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Author Info
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={255}
                  required
                  className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    maxLength={255}
                    className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    placeholder="CEO"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    maxLength={255}
                    className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <ImageUpload
                value={avatarUrl}
                onChange={setAvatarUrl}
                folder="testimonials"
                label="Avatar"
                hint="Square image recommended"
                aspectClass="aspect-square w-24"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="glass rounded-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as TestimonialStatus)
                  }
                  className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-foreground/20 text-primary-600 focus:ring-primary-500/30"
                />
                <span className="text-sm font-medium text-foreground">
                  Featured testimonial
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-glass-primary w-full rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Testimonial"
                  : "Create Testimonial"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/testimonials")}
              className="btn-glass-secondary w-full rounded-xl px-5 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
