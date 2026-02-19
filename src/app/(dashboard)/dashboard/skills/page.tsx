"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminDelete, adminPatch, revalidateCache } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Modal } from "@/components/dashboard/modal";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useToast } from "@/components/dashboard/toast-context";
import type { Skill } from "@/types/api";

const inputClass =
  "glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30 placeholder:text-muted-foreground";

export default function SkillsPage() {
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Edit modal ── */
  const [editItem, setEditItem] = useState<Skill | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editProficiency, setEditProficiency] = useState(80);
  const [editIconUrl, setEditIconUrl] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editIsVisible, setEditIsVisible] = useState(true);
  const [updating, setUpdating] = useState(false);

  function openEdit(skill: Skill) {
    setEditItem(skill);
    setEditName(skill.name);
    setEditCategory(skill.category ?? "");
    setEditProficiency(skill.proficiency);
    setEditIconUrl(skill.iconUrl ?? "");
    setEditSortOrder(skill.sortOrder);
    setEditIsVisible(skill.isVisible);
  }

  async function handleEdit() {
    if (!editItem) return;
    setUpdating(true);
    try {
      await adminPatch(`/skills/${editItem.id}`, {
        name: editName.trim(),
        category: editCategory.trim() || null,
        proficiency: editProficiency,
        iconUrl: editIconUrl.trim() || null,
        sortOrder: editSortOrder,
        isVisible: editIsVisible,
      });
      await revalidateCache("skills");
      toast("Skill updated", "success");
      setEditItem(null);
      fetchData();
    } catch {
      toast("Failed to update", "error");
    } finally {
      setUpdating(false);
    }
  }

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
            <div className="h-full rounded-full bg-primary-500" style={{ width: `${r.proficiency}%` }} />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{r.proficiency}%</span>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (r) =>
        r.category ? (
          <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">{r.category}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "sortOrder",
      label: "Order",
      sortable: true,
      render: (r) => <span className="text-sm text-muted-foreground">{r.sortOrder}</span>,
    },
    {
      key: "isVisible",
      label: "Visible",
      render: (r) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${r.isVisible ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
          {r.isVisible ? "Yes" : "Hidden"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
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
      const result = await adminGet<Skill[]>("/skills");
      setSkills(Array.isArray(result) ? result : []);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
      gsap.from(items, { opacity: 0, y: 24, duration: DURATION_ENTRY, stagger: STAGGER_DELAY, ease: GSAP_EASE, onComplete() { gsap.set(items, { clearProps: "transform,opacity" }); } });
    },
    { dependencies: [loading], scope: containerRef },
  );

  return (
    <div ref={containerRef}>
      <PageHeader title="Tech Stack" description="Manage the skills and technologies displayed on your homepage." action={
        <Link href="/dashboard/skills/new" className="btn-glass-primary rounded-xl px-5 py-2 text-sm font-semibold text-white">Add Skill</Link>
      } />

      {loading ? <LoadingState /> : (
        <div data-animate>
          <DataTable columns={columns} data={skills} keyExtractor={(r) => r.id} onRowClick={(r) => openEdit(r)} emptyMessage="No skills found. Add your first skill to get started." />
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Skill" message="Are you sure you want to delete this skill? This action cannot be undone." loading={deleting} />

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Skill" footer={
        <>
          <button onClick={() => setEditItem(null)} className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium">Cancel</button>
          <button onClick={handleEdit} disabled={updating || !editName.trim()} className="btn-glass-primary rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </>
      }>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Name *</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} placeholder="e.g. React, TypeScript" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
            <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={inputClass} placeholder="e.g. Frontend, Backend" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Proficiency — {editProficiency}%</label>
            <input type="range" min={0} max={100} step={5} value={editProficiency} onChange={(e) => setEditProficiency(Number(e.target.value))} className="w-full accent-primary-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Icon URL</label>
            <input type="url" value={editIconUrl} onChange={(e) => setEditIconUrl(e.target.value)} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Sort Order</label>
            <input type="number" value={editSortOrder} onChange={(e) => setEditSortOrder(Number(e.target.value))} min={0} className={inputClass} />
          </div>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={editIsVisible} onChange={(e) => setEditIsVisible(e.target.checked)} className="h-4 w-4 rounded border-foreground/20 text-primary-600 focus:ring-primary-500/30" />
            <span className="text-sm font-medium text-foreground">Visible on homepage</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
