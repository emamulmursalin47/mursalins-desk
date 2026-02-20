"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminDelete, revalidateCache } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Pagination } from "@/components/dashboard/pagination";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useToast } from "@/components/dashboard/toast-context";
import type { AdminProduct } from "@/types/admin";
import type { PaginatedResult } from "@/types/api";

export default function ProductsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [data, setData] = useState<PaginatedResult<AdminProduct> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const columns: Column<AdminProduct>[] = [
    { key: "name", label: "Name", sortable: true },
    {
      key: "type", label: "Type",
      render: (r) => <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{r.type.replace(/_/g, " ")}</span>,
    },
    {
      key: "price", label: "Price", sortable: true,
      render: (r) => `${r.currency} ${Number(r.price).toLocaleString()}${r.salePrice ? ` (${r.currency} ${Number(r.salePrice).toLocaleString()})` : ""}`,
    },
    { key: "licenseType", label: "License" },
    {
      key: "isFeatured", label: "Featured",
      render: (r) => <span className={r.isFeatured ? "text-primary-500" : "text-muted-foreground"}>{r.isFeatured ? "Yes" : "No"}</span>,
    },
    {
      key: "actions", label: "",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/products/${r.id}/edit`); }} className="cursor-pointer text-xs font-medium text-primary-600 hover:text-primary-500">Edit</button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }} className="cursor-pointer text-xs font-medium text-destructive hover:text-destructive/80">Delete</button>
        </div>
      ),
    },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminGet<PaginatedResult<AdminProduct>>(`/products?page=${page}&limit=20`);
      setData(result);
    } catch { /* */ } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminDelete(`/products/${deleteId}`);
      await revalidateCache("products");
      toast("Product deleted", "success");
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
      <PageHeader title="Products" description="Manage your digital products." action={
        <Link href="/dashboard/products/new" className="btn-glass-primary rounded-xl px-5 py-2 text-sm font-semibold text-white">New Product</Link>
      } />

      {loading ? <LoadingState /> : (
        <div data-animate>
          <DataTable columns={columns} data={data?.data ?? []} keyExtractor={(r) => r.id} onRowClick={(r) => router.push(`/dashboard/products/${r.id}/edit`)} emptyMessage="No products found." />
          {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Product" message="Are you sure you want to delete this product?" loading={deleting} />
    </div>
  );
}
