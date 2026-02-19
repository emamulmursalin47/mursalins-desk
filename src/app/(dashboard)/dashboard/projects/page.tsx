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
import type { AdminProject } from "@/types/admin";
import type { PaginatedResult } from "@/types/api";

const TABS = ["All", "INQUIRY", "PROPOSAL", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"] as const;

export default function ProjectsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<PaginatedResult<AdminProject> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<string>("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const columns: Column<AdminProject>[] = [
    { key: "title", label: "Title", sortable: true },
    {
      key: "client",
      label: "Client",
      render: (r) => r.client ? `${r.client.firstName ?? ""} ${r.client.lastName ?? ""}`.trim() || r.client.email : "—",
    },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "technologies",
      label: "Tech",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.technologies.slice(0, 3).map((t) => (
            <span key={t} className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{t}</span>
          ))}
          {r.technologies.length > 3 && <span className="text-xs text-muted-foreground">+{r.technologies.length - 3}</span>}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (r) => new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/projects/${r.id}/edit`); }} className="text-xs font-medium text-primary-600 hover:text-primary-500">Edit</button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }} className="text-xs font-medium text-destructive hover:text-destructive/80">Delete</button>
        </div>
      ),
    },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = tab !== "All" ? `&status=${tab}` : "";
      const result = await adminGet<PaginatedResult<AdminProject>>(`/projects?page=${page}&limit=20${statusParam}`);
      setData(result);
    } catch { /* */ } finally { setLoading(false); }
  }, [page, tab]);

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

      <div data-animate className="mb-6 flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === t ? "glass text-primary-600" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "All" ? "All" : t.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? <LoadingState /> : (
        <div data-animate>
          <DataTable columns={columns} data={data?.data ?? []} keyExtractor={(r) => r.id} onRowClick={(r) => router.push(`/dashboard/projects/${r.id}/edit`)} emptyMessage="No projects found." />
          {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
        </div>
      )}
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Project" message="Are you sure you want to delete this project?" loading={deleting} />
    </div>
  );
}
