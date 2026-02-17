"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminPost, adminPatch, revalidateCache } from "@/lib/admin-api";
import { useToast } from "@/components/dashboard/toast-context";
import { ImageUpload } from "@/components/dashboard/image-upload";
import type { Experience } from "@/types/api";

interface ExperienceFormProps {
  experience?: Experience;
}

export function ExperienceForm({ experience }: ExperienceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!experience;

  const [title, setTitle] = useState(experience?.title ?? "");
  const [company, setCompany] = useState(experience?.company ?? "");
  const [companyLogo, setCompanyLogo] = useState(experience?.companyLogo ?? "");
  const [location, setLocation] = useState(experience?.location ?? "");
  const [description, setDescription] = useState(experience?.description ?? "");
  const [startDate, setStartDate] = useState(
    experience?.startDate ? experience.startDate.slice(0, 10) : "",
  );
  const [endDate, setEndDate] = useState(
    experience?.endDate ? experience.endDate.slice(0, 10) : "",
  );
  const [isCurrent, setIsCurrent] = useState(experience?.isCurrent ?? false);
  const [technologies, setTechnologies] = useState(
    experience?.technologies.join(", ") ?? "",
  );
  const [sortOrder, setSortOrder] = useState(experience?.sortOrder ?? 0);
  const [isVisible, setIsVisible] = useState(experience?.isVisible ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !startDate) {
      toast("Title, company, and start date are required", "error");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        company: company.trim(),
        companyLogo: companyLogo.trim() || null,
        location: location.trim() || null,
        description: description.trim() || null,
        startDate: new Date(startDate).toISOString(),
        endDate: isCurrent ? null : endDate ? new Date(endDate).toISOString() : null,
        isCurrent,
        technologies: technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        sortOrder,
        isVisible,
      };

      if (isEdit) {
        await adminPatch(`/experiences/${experience.id}`, body);
        toast("Experience updated", "success");
      } else {
        await adminPost("/experiences", body);
        toast("Experience created", "success");
      }
      await revalidateCache("experiences");
      router.push("/dashboard/experiences");
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
              Position Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={255}
                  required
                  className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="e.g. Senior Full-Stack Developer"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    maxLength={255}
                    required
                    className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    placeholder="e.g. Google"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    maxLength={255}
                    className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={5000}
                  rows={4}
                  className="glass-subtle w-full resize-none rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="Describe your role and accomplishments..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    End Date {isCurrent && "(Current)"}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isCurrent}
                    className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="h-4 w-4 rounded border-foreground/20 text-primary-600 focus:ring-primary-500/30"
                />
                <span className="text-sm font-medium text-foreground">
                  I currently work here
                </span>
              </label>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Technologies
                </label>
                <input
                  type="text"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="React, TypeScript, Node.js (comma-separated)"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Separate with commas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="glass rounded-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Company Logo
            </h3>
            <ImageUpload
              value={companyLogo}
              onChange={setCompanyLogo}
              folder="experiences"
              label="Logo"
              hint="Square logo works best (PNG, SVG)"
            />
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  min={0}
                  className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Lower numbers appear first
                </p>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="h-4 w-4 rounded border-foreground/20 text-primary-600 focus:ring-primary-500/30"
                />
                <span className="text-sm font-medium text-foreground">
                  Visible on site
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
                  ? "Update Experience"
                  : "Create Experience"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/experiences")}
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
