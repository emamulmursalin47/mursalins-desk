"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminDelete, adminPatch, revalidateCache } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Modal } from "@/components/dashboard/modal";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useToast } from "@/components/dashboard/toast-context";
import type { Experience } from "@/types/api";

interface PaginatedResponse {
  data: Experience[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const inputClass =
  "glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30 placeholder:text-muted-foreground";

export default function ExperiencesPage() {
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Edit modal ── */
  const [editItem, setEditItem] = useState<Experience | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editIsCurrent, setEditIsCurrent] = useState(false);
  const [editTechnologies, setEditTechnologies] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editIsVisible, setEditIsVisible] = useState(true);
  const [updating, setUpdating] = useState(false);

  function openEdit(exp: Experience) {
    setEditItem(exp);
    setEditTitle(exp.title);
    setEditCompany(exp.company);
    setEditLocation(exp.location ?? "");
    setEditDescription(exp.description ?? "");
    setEditStartDate(exp.startDate ? exp.startDate.slice(0, 10) : "");
    setEditEndDate(exp.endDate ? exp.endDate.slice(0, 10) : "");
    setEditIsCurrent(exp.isCurrent);
    setEditTechnologies(exp.technologies.join(", "));
    setEditSortOrder(exp.sortOrder);
    setEditIsVisible(exp.isVisible);
  }

  async function handleEdit() {
    if (!editItem) return;
    setUpdating(true);
    try {
      await adminPatch(`/experiences/${editItem.id}`, {
        title: editTitle.trim(),
        company: editCompany.trim(),
        location: editLocation.trim() || null,
        description: editDescription.trim() || null,
        startDate: new Date(editStartDate).toISOString(),
        endDate: editIsCurrent ? null : editEndDate ? new Date(editEndDate).toISOString() : null,
        isCurrent: editIsCurrent,
        technologies: editTechnologies.split(",").map((t) => t.trim()).filter(Boolean),
        sortOrder: editSortOrder,
        isVisible: editIsVisible,
      });
      await revalidateCache("experiences");
      toast("Experience updated", "success");
      setEditItem(null);
      fetchData();
    } catch {
      toast("Failed to update", "error");
    } finally {
      setUpdating(false);
    }
  }

  const columns: Column<Experience>[] = [
    {
      key: "title", label: "Position", sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-50">
            {r.companyLogo ? (
              <Image src={r.companyLogo} alt={r.company} width={36} height={36} className="h-full w-full object-contain p-0.5" />
            ) : (
              <span className="text-xs font-bold text-primary-500">{r.company.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="font-medium text-foreground">{r.title}</div>
            <div className="text-xs text-muted-foreground">{r.company}{r.location && ` · ${r.location}`}</div>
          </div>
        </div>
      ),
    },
    {
      key: "startDate", label: "Period", sortable: true,
      render: (r) => <span className="text-sm text-muted-foreground">{formatDate(r.startDate)} — {r.isCurrent ? "Present" : formatDate(r.endDate)}</span>,
    },
    {
      key: "isCurrent", label: "Status",
      render: (r) => (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${r.isCurrent ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
          {r.isCurrent && <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />}
          {r.isCurrent ? "Current" : "Past"}
        </span>
      ),
    },
    {
      key: "isVisible", label: "Visible",
      render: (r) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${r.isVisible ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
          {r.isVisible ? "Yes" : "Hidden"}
        </span>
      ),
    },
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
      const result = await adminGet<PaginatedResponse>("/experiences/admin");
      setExperiences(Array.isArray(result) ? result : result.data ?? []);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminDelete(`/experiences/${deleteId}`);
      await revalidateCache("experiences");
      toast("Experience deleted", "success");
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
      <PageHeader title="Experience" description="Manage your career history and work experience." action={
        <Link href="/dashboard/experiences/new" className="btn-glass-primary rounded-xl px-5 py-2 text-sm font-semibold text-white">Add Experience</Link>
      } />

      {loading ? <LoadingState /> : (
        <div data-animate>
          <DataTable columns={columns} data={experiences} keyExtractor={(r) => r.id} onRowClick={(r) => openEdit(r)} emptyMessage="No experiences found. Add your first work experience to get started." />
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Experience" message="Are you sure you want to delete this experience? This action cannot be undone." loading={deleting} />

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Experience" size="xl" footer={
        <>
          <button onClick={() => setEditItem(null)} className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium">Cancel</button>
          <button onClick={handleEdit} disabled={updating || !editTitle.trim() || !editCompany.trim() || !editStartDate} className="btn-glass-primary rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </>
      }>
        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Job Title *</label>
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputClass} placeholder="e.g. Senior Full-Stack Developer" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Company *</label>
              <input type="text" value={editCompany} onChange={(e) => setEditCompany(e.target.value)} className={inputClass} placeholder="e.g. Google" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Location</label>
              <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className={inputClass} placeholder="e.g. San Francisco, CA" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Describe your role..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Start Date *</label>
              <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">End Date</label>
              <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} disabled={editIsCurrent} className={`${inputClass} disabled:opacity-50`} />
            </div>
          </div>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={editIsCurrent} onChange={(e) => setEditIsCurrent(e.target.checked)} className="h-4 w-4 rounded border-foreground/20 text-primary-600 focus:ring-primary-500/30" />
            <span className="text-sm font-medium text-foreground">I currently work here</span>
          </label>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Technologies</label>
            <input type="text" value={editTechnologies} onChange={(e) => setEditTechnologies(e.target.value)} className={inputClass} placeholder="React, TypeScript, Node.js (comma-separated)" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Sort Order</label>
            <input type="number" value={editSortOrder} onChange={(e) => setEditSortOrder(Number(e.target.value))} min={0} className={inputClass} />
          </div>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={editIsVisible} onChange={(e) => setEditIsVisible(e.target.checked)} className="h-4 w-4 rounded border-foreground/20 text-primary-600 focus:ring-primary-500/30" />
            <span className="text-sm font-medium text-foreground">Visible on site</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
