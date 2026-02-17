"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminDelete, revalidateCache } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useToast } from "@/components/dashboard/toast-context";
import type { Experience } from "@/types/api";

interface PaginatedResponse {
  data: Experience[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function ExperiencesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const columns: Column<Experience>[] = [
    {
      key: "title",
      label: "Position",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-50">
            {r.companyLogo ? (
              <Image
                src={r.companyLogo}
                alt={r.company}
                width={36}
                height={36}
                className="h-full w-full object-contain p-0.5"
              />
            ) : (
              <span className="text-xs font-bold text-primary-500">
                {r.company.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <div className="font-medium text-foreground">{r.title}</div>
            <div className="text-xs text-muted-foreground">
              {r.company}
              {r.location && ` · ${r.location}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "startDate",
      label: "Period",
      sortable: true,
      render: (r) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(r.startDate)} — {r.isCurrent ? "Present" : formatDate(r.endDate)}
        </span>
      ),
    },
    {
      key: "isCurrent",
      label: "Status",
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
            r.isCurrent
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {r.isCurrent && (
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
          )}
          {r.isCurrent ? "Current" : "Past"}
        </span>
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
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/dashboard/experiences/${r.id}/edit`}
            className="text-xs font-medium text-primary-600 hover:text-primary-500"
          >
            Edit
          </Link>
          <button
            onClick={() => setDeleteId(r.id)}
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
      const result = await adminGet<PaginatedResponse>("/experiences/admin");
      setExperiences(Array.isArray(result) ? result : result.data ?? []);
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
      await adminDelete(`/experiences/${deleteId}`);
      await revalidateCache("experiences");
      toast("Experience deleted", "success");
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
        title="Experience"
        description="Manage your career history and work experience."
        action={
          <Link
            href="/dashboard/experiences/new"
            className="btn-glass-primary rounded-xl px-5 py-2 text-sm font-semibold text-white"
          >
            Add Experience
          </Link>
        }
      />

      {loading ? (
        <LoadingState />
      ) : (
        <div data-animate>
          <DataTable
            columns={columns}
            data={experiences}
            keyExtractor={(r) => r.id}
            onRowClick={(r) =>
              router.push(`/dashboard/experiences/${r.id}/edit`)
            }
            emptyMessage="No experiences found. Add your first work experience to get started."
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Experience"
        message="Are you sure you want to delete this experience? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
