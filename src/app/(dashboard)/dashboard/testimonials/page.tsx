"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminDelete, revalidateCache } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Pagination } from "@/components/dashboard/pagination";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useToast } from "@/components/dashboard/toast-context";
import type { AdminTestimonial } from "@/types/admin";
import type { PaginatedResult } from "@/types/api";

const TABS = ["All", "PENDING", "APPROVED", "REJECTED"] as const;

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5 text-accent-500">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function TestimonialsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<PaginatedResult<AdminTestimonial> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<string>("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const columns: Column<AdminTestimonial>[] = [
    {
      key: "name",
      label: "Author",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.avatarUrl ? (
            <img
              src={r.avatarUrl}
              alt={r.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
              {r.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium text-foreground">{r.name}</div>
            {(r.role || r.company) && (
              <div className="text-xs text-muted-foreground">
                {[r.role, r.company].filter(Boolean).join(" at ")}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "content",
      label: "Content",
      render: (r) => (
        <span className="block max-w-[300px] truncate text-sm text-muted-foreground">
          &ldquo;{r.content}&rdquo;
        </span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (r) => <StarRating rating={r.rating} />,
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={r.status} />
          {r.isFeatured && (
            <span className="inline-flex items-center rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-700">
              Featured
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (r) =>
        new Date(r.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/testimonials/${r.id}/edit`);
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
      const statusParam = tab !== "All" ? `&status=${tab}` : "";
      const result = await adminGet<PaginatedResult<AdminTestimonial>>(
        `/testimonials/admin?page=${page}&limit=20${statusParam}`,
      );
      setData(result);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [page, tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminDelete(`/testimonials/${deleteId}`);
      await revalidateCache("testimonials");
      toast("Testimonial deleted", "success");
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
        onComplete() { gsap.set(items, { clearProps: "transform,opacity" }); },
      });
    },
    { dependencies: [loading], scope: containerRef },
  );

  return (
    <div ref={containerRef}>
      <PageHeader
        title="Testimonials"
        description="Manage client testimonials and reviews."
        action={
          <Link
            href="/dashboard/testimonials/new"
            className="btn-glass-primary rounded-xl px-5 py-2 text-sm font-semibold text-white"
          >
            Add Testimonial
          </Link>
        }
      />

      {/* Filter Tabs */}
      <div data-animate className="mb-6 flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? "glass text-primary-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "All" ? "All" : t.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <div data-animate>
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => router.push(`/dashboard/testimonials/${r.id}`)}
            emptyMessage="No testimonials found."
          />
          {data?.meta && (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
