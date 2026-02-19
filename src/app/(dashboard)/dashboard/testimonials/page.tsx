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
import type { AdminTestimonial, TestimonialStatus } from "@/types/admin";
import type { PaginatedResult } from "@/types/api";

const TABS = ["All", "PENDING", "APPROVED", "REJECTED"] as const;

const inputClass =
  "glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30 placeholder:text-muted-foreground";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5 text-accent-500">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-25"}>★</span>
      ))}
    </span>
  );
}

export default function TestimonialsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<PaginatedResult<AdminTestimonial> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<string>("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Edit modal ── */
  const [editItem, setEditItem] = useState<AdminTestimonial | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editStatus, setEditStatus] = useState<TestimonialStatus>("APPROVED");
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [updating, setUpdating] = useState(false);

  function openEdit(t: AdminTestimonial) {
    setEditItem(t);
    setEditName(t.name);
    setEditRole(t.role ?? "");
    setEditCompany(t.company ?? "");
    setEditContent(t.content);
    setEditRating(t.rating);
    setEditStatus(t.status);
    setEditIsFeatured(t.isFeatured);
  }

  async function handleEdit() {
    if (!editItem) return;
    setUpdating(true);
    try {
      await adminPatch(`/testimonials/${editItem.id}`, {
        name: editName.trim(),
        content: editContent.trim(),
        rating: editRating,
        role: editRole.trim() || undefined,
        company: editCompany.trim() || undefined,
        status: editStatus,
        isFeatured: editIsFeatured,
      });
      await revalidateCache("testimonials");
      toast("Testimonial updated", "success");
      setEditItem(null);
      fetchData();
    } catch {
      toast("Failed to update", "error");
    } finally {
      setUpdating(false);
    }
  }

  const columns: Column<AdminTestimonial>[] = [
    {
      key: "name", label: "Author", sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.avatarUrl ? (
            <img src={r.avatarUrl} alt={r.name} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">{r.name.charAt(0).toUpperCase()}</div>
          )}
          <div>
            <div className="font-medium text-foreground">{r.name}</div>
            {(r.role || r.company) && <div className="text-xs text-muted-foreground">{[r.role, r.company].filter(Boolean).join(" at ")}</div>}
          </div>
        </div>
      ),
    },
    { key: "content", label: "Content", render: (r) => <span className="block max-w-75 truncate text-sm text-muted-foreground">&ldquo;{r.content}&rdquo;</span> },
    { key: "rating", label: "Rating", render: (r) => <StarRating rating={r.rating} /> },
    {
      key: "status", label: "Status",
      render: (r) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={r.status} />
          {r.isFeatured && <span className="inline-flex items-center rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-700">Featured</span>}
        </div>
      ),
    },
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
      const result = await adminGet<PaginatedResult<AdminTestimonial>>(`/testimonials/admin?page=${page}&limit=20`);
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
      await adminDelete(`/testimonials/${deleteId}`);
      await revalidateCache("testimonials");
      toast("Testimonial deleted", "success");
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
      <PageHeader title="Testimonials" description="Manage client testimonials and reviews." action={
        <Link href="/dashboard/testimonials/new" className="btn-glass-primary rounded-xl px-5 py-2 text-sm font-semibold text-white">Add Testimonial</Link>
      } />

      <FilterTabs tabs={TABS} active={tab} onChange={(t) => { setTab(t); setPage(1); }} />

      {loading ? <LoadingState /> : (
        <div data-animate>
          <DataTable columns={columns} data={filtered} keyExtractor={(r) => r.id} onRowClick={(r) => openEdit(r)} emptyMessage="No testimonials found." />
          {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Testimonial" message="Are you sure you want to delete this testimonial? This action cannot be undone." loading={deleting} />

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Testimonial" footer={
        <>
          <button onClick={() => setEditItem(null)} className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium">Cancel</button>
          <button onClick={handleEdit} disabled={updating || !editName.trim() || !editContent.trim()} className="btn-glass-primary rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </>
      }>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Content *</label>
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="What did the client say..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setEditRating(star)} className={`text-2xl transition-colors ${star <= editRating ? "text-accent-500" : "text-foreground/15"}`}>★</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Name *</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} placeholder="John Doe" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Role</label>
              <input type="text" value={editRole} onChange={(e) => setEditRole(e.target.value)} className={inputClass} placeholder="CEO" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Company</label>
              <input type="text" value={editCompany} onChange={(e) => setEditCompany(e.target.value)} className={inputClass} placeholder="Acme Corp" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as TestimonialStatus)} className={inputClass}>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={editIsFeatured} onChange={(e) => setEditIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-foreground/20 text-primary-600 focus:ring-primary-500/30" />
            <span className="text-sm font-medium text-foreground">Featured testimonial</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
