"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminPost, adminPatch, revalidateCache } from "@/lib/admin-api";
import { useToast } from "@/components/dashboard/toast-context";
import type { Skill } from "@/types/api";

interface SkillFormProps {
  skill?: Skill;
}

export function SkillForm({ skill }: SkillFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!skill;

  const [name, setName] = useState(skill?.name ?? "");
  const [category, setCategory] = useState(skill?.category ?? "");
  const [proficiency, setProficiency] = useState(skill?.proficiency ?? 80);
  const [iconUrl, setIconUrl] = useState(skill?.iconUrl ?? "");
  const [sortOrder, setSortOrder] = useState(skill?.sortOrder ?? 0);
  const [isVisible, setIsVisible] = useState(skill?.isVisible ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast("Name is required", "error");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        category: category.trim() || null,
        proficiency,
        iconUrl: iconUrl.trim() || null,
        sortOrder,
        isVisible,
      };

      if (isEdit) {
        await adminPatch(`/skills/${skill.id}`, body);
        toast("Skill updated", "success");
      } else {
        await adminPost("/skills", body);
        toast("Skill created", "success");
      }
      await revalidateCache("skills");
      router.push("/dashboard/skills");
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
              Skill Details
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
                  placeholder="e.g. React, TypeScript, Node.js"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  maxLength={255}
                  className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="e.g. Frontend, Backend, DevOps, Design"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Proficiency — {proficiency}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={proficiency}
                  onChange={(e) => setProficiency(Number(e.target.value))}
                  className="w-full accent-primary-500"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Icon URL
                </label>
                <input
                  type="url"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  className="glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="https://cdn.example.com/icons/react.svg"
                />
              </div>
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
                  Visible on homepage
                </span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="glass rounded-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Preview
            </h3>
            <div className="flex flex-col items-center gap-2 rounded-xl bg-background p-4">
              <div className="relative h-10 w-10">
                <svg className="h-10 w-10 -rotate-90" viewBox="0 0 40 40">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-border"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${(proficiency / 100) * 100.53} 100.53`}
                    strokeLinecap="round"
                    className="text-primary-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                  {proficiency}
                </span>
              </div>
              <span className="text-center text-xs font-medium text-foreground">
                {name || "Skill Name"}
              </span>
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
                  ? "Update Skill"
                  : "Create Skill"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/skills")}
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
