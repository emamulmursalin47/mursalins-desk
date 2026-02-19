"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminDelete, adminPatch, revalidateCache } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Pagination } from "@/components/dashboard/pagination";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Modal } from "@/components/dashboard/modal";
import { LoadingState } from "@/components/dashboard/loading-state";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { useToast } from "@/components/dashboard/toast-context";
import type { AdminPost } from "@/types/admin";
import type { PaginatedResult } from "@/types/api";

const TABS = ["All", "DRAFT", "PUBLISHED", "ARCHIVED"] as const;

const inputClass =
  "glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30 placeholder:text-muted-foreground";

export default function BlogPage() {
  const { toast } = useToast();
  const [data, setData] = useState<PaginatedResult<AdminPost> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<string>("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Edit modal ── */
  const [editItem, setEditItem] = useState<AdminPost | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editStatus, setEditStatus] = useState<string>("DRAFT");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [updating, setUpdating] = useState(false);

  function openEdit(post: AdminPost) {
    setEditItem(post);
    setEditTitle(post.title);
    setEditSlug(post.slug);
    setEditStatus(post.status);
    setEditExcerpt(post.excerpt ?? "");
    setEditIsFeatured(post.isFeatured);
  }

  async function handleEdit() {
    if (!editItem) return;
    setUpdating(true);
    try {
      await adminPatch(`/blog/posts/${editItem.id}`, {
        title: editTitle.trim(),
        slug: editSlug.trim(),
        status: editStatus,
        excerpt: editExcerpt.trim() || undefined,
        isFeatured: editIsFeatured,
      });
      await revalidateCache("posts");
      toast("Post updated", "success");
      setEditItem(null);
      fetchData();
    } catch { toast("Failed to update", "error"); }
    finally { setUpdating(false); }
  }

  const columns: Column<AdminPost>[] = [
    { key: "title", label: "Title", sortable: true },
    { key: "author", label: "Author", render: (r) => r.author ? `${r.author.firstName ?? ""} ${r.author.lastName ?? ""}`.trim() || "—" : "—" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "createdAt", label: "Date", sortable: true, render: (r) => new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
    {
      key: "actions", label: "",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="cursor-pointer text-xs font-medium text-primary-600 hover:text-primary-500">Edit</button>
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
          <DataTable columns={columns} data={filtered} keyExtractor={(r) => r.id} onRowClick={(r) => openEdit(r)} emptyMessage="No posts found." />
          {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Post" message="Are you sure you want to delete this post? This action cannot be undone." loading={deleting} />

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Post" footer={
        <>
          <button onClick={() => setEditItem(null)} className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium">Cancel</button>
          <button onClick={handleEdit} disabled={updating || !editTitle.trim()} className="btn-glass-primary rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </>
      }>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Title *</label>
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputClass} placeholder="Post title" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Slug</label>
            <input type="text" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} className={inputClass} placeholder="post-slug" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className={inputClass}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Excerpt</label>
            <textarea value={editExcerpt} onChange={(e) => setEditExcerpt(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Brief summary..." />
          </div>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={editIsFeatured} onChange={(e) => setEditIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-foreground/20 text-primary-600 focus:ring-primary-500/30" />
            <span className="text-sm font-medium text-foreground">Featured post</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
