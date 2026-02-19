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
import type { AdminProject } from "@/types/admin";
import type { PaginatedResult } from "@/types/api";

const TABS = ["All", "INQUIRY", "PROPOSAL", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"] as const;

const inputClass =
  "glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30 placeholder:text-muted-foreground";

export default function ProjectsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<PaginatedResult<AdminProject> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<string>("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Edit modal ── */
  const [editItem, setEditItem] = useState<AdminProject | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<string>("INQUIRY");
  const [editBudget, setEditBudget] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editLiveUrl, setEditLiveUrl] = useState("");
  const [editRepositoryUrl, setEditRepositoryUrl] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [updating, setUpdating] = useState(false);

  function openEdit(p: AdminProject) {
    setEditItem(p);
    setEditTitle(p.title);
    setEditSlug(p.slug);
    setEditDescription(p.description ?? "");
    setEditStatus(p.status);
    setEditBudget(p.budget ?? "");
    setEditStartDate(p.startDate?.split("T")[0] ?? "");
    setEditEndDate(p.endDate?.split("T")[0] ?? "");
    setEditLiveUrl(p.liveUrl ?? "");
    setEditRepositoryUrl(p.repositoryUrl ?? "");
    setEditIsPublic(p.isPublic);
  }

  async function handleEdit() {
    if (!editItem) return;
    setUpdating(true);
    try {
      await adminPatch(`/projects/${editItem.id}`, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        status: editStatus,
        budget: editBudget.trim() ? Number(editBudget) : undefined,
        startDate: editStartDate || undefined,
        endDate: editEndDate || undefined,
        liveUrl: editLiveUrl.trim() || undefined,
        repositoryUrl: editRepositoryUrl.trim() || undefined,
        isPublic: editIsPublic,
      });
      await revalidateCache("projects");
      toast("Project updated", "success");
      setEditItem(null);
      fetchData();
    } catch { toast("Failed to update", "error"); }
    finally { setUpdating(false); }
  }

  const columns: Column<AdminProject>[] = [
    { key: "title", label: "Title", sortable: true },
    { key: "client", label: "Client", render: (r) => r.client ? `${r.client.firstName ?? ""} ${r.client.lastName ?? ""}`.trim() || r.client.email : "—" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "technologies", label: "Tech",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.technologies.slice(0, 3).map((t) => <span key={t} className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{t}</span>)}
          {r.technologies.length > 3 && <span className="text-xs text-muted-foreground">+{r.technologies.length - 3}</span>}
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
      const result = await adminGet<PaginatedResult<AdminProject>>(`/projects?page=${page}&limit=20`);
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
      await adminDelete(`/projects/${deleteId}`);
      await revalidateCache("projects");
      toast("Project deleted", "success");
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
      <PageHeader title="Projects" description="Manage portfolio projects." action={
        <Link href="/dashboard/projects/new" className="btn-glass-primary rounded-xl px-5 py-2 text-sm font-semibold text-white">New Project</Link>
      } />

      <FilterTabs tabs={TABS} active={tab} onChange={(t) => { setTab(t); setPage(1); }} />

      {loading ? <LoadingState /> : (
        <div data-animate>
          <DataTable columns={columns} data={filtered} keyExtractor={(r) => r.id} onRowClick={(r) => openEdit(r)} emptyMessage="No projects found." />
          {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Project" message="Are you sure you want to delete this project?" loading={deleting} />

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Project" size="xl" footer={
        <>
          <button onClick={() => setEditItem(null)} className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium">Cancel</button>
          <button onClick={handleEdit} disabled={updating || !editTitle.trim()} className="btn-glass-primary rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </>
      }>
        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Title *</label>
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputClass} placeholder="Project title" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Slug</label>
            <input type="text" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} className={inputClass} placeholder="project-slug" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Project description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className={inputClass}>
                <option value="INQUIRY">Inquiry</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Budget</label>
              <input type="number" value={editBudget} onChange={(e) => setEditBudget(e.target.value)} className={inputClass} placeholder="5000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Start Date</label>
              <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">End Date</label>
              <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Live URL</label>
            <input type="url" value={editLiveUrl} onChange={(e) => setEditLiveUrl(e.target.value)} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Repository URL</label>
            <input type="url" value={editRepositoryUrl} onChange={(e) => setEditRepositoryUrl(e.target.value)} className={inputClass} placeholder="https://..." />
          </div>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={editIsPublic} onChange={(e) => setEditIsPublic(e.target.checked)} className="h-4 w-4 rounded border-foreground/20 text-primary-600 focus:ring-primary-500/30" />
            <span className="text-sm font-medium text-foreground">Public project</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
