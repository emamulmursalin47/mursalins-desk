"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminDelete, revalidateCache } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useToast } from "@/components/dashboard/toast-context";
import type { Skill } from "@/types/api";

export default function SkillsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const columns: Column<Skill>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
            <svg className="h-5 w-5 -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${(r.proficiency / 100) * 100.53} 100.53`} strokeLinecap="round" className="text-primary-500" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-foreground">{r.name}</div>
            {r.category && (
              <div className="text-xs text-muted-foreground">{r.category}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "proficiency",
      label: "Proficiency",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary-500"
              style={{ width: `${r.proficiency}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {r.proficiency}%
          </span>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (r) =>
        r.category ? (
          <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
            {r.category}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "sortOrder",
      label: "Order",
      sortable: true,
      render: (r) => (
        <span className="text-sm text-muted-foreground">{r.sortOrder}</span>
      ),
    },
    {
      key: "isVisible",
      label: "Visible",
      render: (r) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            r.isVisible
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {r.isVisible ? "Yes" : "Hidden"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/skills/${r.id}/edit`);
            }}
            className="text-xs font-medium text-primary-600 hover:text-primary-500"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(r.id);
            }}
            className="text-xs font-medium text-destructive hover:text-destructive/80"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminGet<Skill[]>("/skills");
      setSkills(Array.isArray(result) ? result : []);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminDelete(`/skills/${deleteId}`);
      await revalidateCache("skills");
      toast("Skill deleted", "success");
      setDeleteId(null);
      fetchData();
    } catch {
      toast("Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }

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

  return (
    <div ref={containerRef}>
      <PageHeader
        title="Tech Stack"
        description="Manage the skills and technologies displayed on your homepage."
        action={
          <Link
            href="/dashboard/skills/new"
            className="btn-glass-primary rounded-xl px-5 py-2 text-sm font-semibold text-white"
          >
            Add Skill
          </Link>
        }
      />

      {loading ? (
        <LoadingState />
      ) : (
        <div data-animate>
          <DataTable
            columns={columns}
            data={skills}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => router.push(`/dashboard/skills/${r.id}/edit`)}
            emptyMessage="No skills found. Add your first skill to get started."
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Skill"
        message="Are you sure you want to delete this skill? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
