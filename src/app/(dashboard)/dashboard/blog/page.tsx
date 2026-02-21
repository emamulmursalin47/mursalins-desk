"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminDelete, revalidateCache } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Pagination } from "@/components/dashboard/pagination";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { LoadingState } from "@/components/dashboard/loading-state";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { useToast } from "@/components/dashboard/toast-context";
import type { AdminPost } from "@/types/admin";
import type { PaginatedResult } from "@/types/api";

const TABS = ["All", "DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"] as const;

export default function BlogPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<PaginatedResult<AdminPost> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<string>("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const columns: Column<AdminPost>[] = [
    { key: "title", label: "Title", sortable: true },
    { key: "author", label: "Author", render: (r) => r.author ? `${r.author.firstName ?? ""} ${r.author.lastName ?? ""}`.trim() || "—" : "—" },
    { key: "status", label: "Status", render: (r) => (
      <div className="flex items-center gap-1.5">
        <StatusBadge status={r.status} />
        {r.status === "SCHEDULED" && r.publishedAt && (
          <span className="text-[10px] text-muted-foreground">
            {new Date(r.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>
    ) },
    { key: "createdAt", label: "Date", sortable: true, render: (r) => new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
    {
      key: "actions", label: "",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/blog/${r.id}/edit`); }} className="cursor-pointer text-xs font-medium text-primary-600 hover:text-primary-500">Edit</button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }} className="cursor-pointer text-xs font-medium text-destructive hover:text-destructive/80">Delete</button>
        </div>
      ),
    },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminGet<PaginatedResult<AdminPost>>(`/blog/posts?page=${page}&limit=20`);
      setData(result);
    } catch { /* */ } finally { setLoading(false); }
  }, [page]);

  const filtered = useMemo(() => {
    const items = data?.data ?? [];
    if (tab === "All") return items;
    return items.filter((r) => r.status === tab);
  }, [data, tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminDelete(`/blog/posts/${deleteId}`);
      await revalidateCache("posts");
      toast("Post deleted", "success");
      setDeleteId(null);
      fetchData();
    } catch { toast("Failed to delete", "error"); }
    finally { setDeleting(false); }
  }

  useGSAP(() => {
    if (loading || !containerRef.current) return;
    const items = containerRef.current.querySelectorAll("[data-animate]");
    if (items.length === 0) return;
    gsap.from(items, { opacity: 0, y: 24, duration: DURATION_ENTRY, stagger: STAGGER_DELAY, ease: GSAP_EASE, onComplete() { gsap.set(items, { clearProps: "transform,opacity" }); } });
  }, { dependencies: [loading], scope: containerRef });

  return (
    <div ref={containerRef}>
      <PageHeader title="Blog Posts" description="Manage your blog content." action={
        <Link href="/dashboard/blog/new" className="btn-glass-primary rounded-xl px-5 py-2 text-sm font-semibold text-white">New Post</Link>
      } />

      <FilterTabs tabs={TABS} active={tab} onChange={(t) => { setTab(t); setPage(1); }} />

      {loading ? <LoadingState /> : (
        <div data-animate>
          <DataTable columns={columns} data={filtered} keyExtractor={(r) => r.id} onRowClick={(r) => router.push(`/dashboard/blog/${r.id}/edit`)} emptyMessage="No posts found." />
          {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Post" message="Are you sure you want to delete this post? This action cannot be undone." loading={deleting} />

    </div>
  );
}
