"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminDelete, adminPatch, revalidateCache } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Pagination } from "@/components/dashboard/pagination";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Modal } from "@/components/dashboard/modal";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useToast } from "@/components/dashboard/toast-context";
import type { AdminProduct } from "@/types/admin";
import type { PaginatedResult } from "@/types/api";

const inputClass =
  "glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30 placeholder:text-muted-foreground";

export default function ProductsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<PaginatedResult<AdminProduct> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Edit modal ── */
  const [editItem, setEditItem] = useState<AdminProduct | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editType, setEditType] = useState<string>("TEMPLATE");
  const [editPrice, setEditPrice] = useState("");
  const [editSalePrice, setEditSalePrice] = useState("");
  const [editCurrency, setEditCurrency] = useState("USD");
  const [editLicenseType, setEditLicenseType] = useState<string>("PERSONAL");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [updating, setUpdating] = useState(false);

  function openEdit(p: AdminProduct) {
    setEditItem(p);
    setEditName(p.name);
    setEditSlug(p.slug);
    setEditType(p.type);
    setEditPrice(String(p.price));
    setEditSalePrice(p.salePrice ? String(p.salePrice) : "");
    setEditCurrency(p.currency);
    setEditLicenseType(p.licenseType);
    setEditIsActive(p.isActive);
    setEditIsFeatured(p.isFeatured);
  }

  async function handleEdit() {
    if (!editItem) return;
    setUpdating(true);
    try {
      await adminPatch(`/products/${editItem.id}`, {
        name: editName.trim(),
        slug: editSlug.trim(),
        type: editType,
        price: Number(editPrice),
        salePrice: editSalePrice ? Number(editSalePrice) : undefined,
        currency: editCurrency,
        licenseType: editLicenseType,
        isActive: editIsActive,
        isFeatured: editIsFeatured,
      });
      await revalidateCache("products");
      toast("Product updated", "success");
      setEditItem(null);
      fetchData();
    } catch { toast("Failed to update", "error"); }
    finally { setUpdating(false); }
  }

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
          <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="text-xs font-medium text-primary-600 hover:text-primary-500">Edit</button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }} className="text-xs font-medium text-destructive hover:text-destructive/80">Delete</button>
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
          <DataTable columns={columns} data={data?.data ?? []} keyExtractor={(r) => r.id} onRowClick={(r) => openEdit(r)} emptyMessage="No products found." />
          {data?.meta && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Product" message="Are you sure you want to delete this product?" loading={deleting} />

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Product" footer={
        <>
          <button onClick={() => setEditItem(null)} className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium">Cancel</button>
          <button onClick={handleEdit} disabled={updating || !editName.trim() || !editPrice} className="btn-glass-primary rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </>
      }>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Name *</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} placeholder="Product name" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Slug</label>
            <input type="text" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} className={inputClass} placeholder="product-slug" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Type</label>
            <select value={editType} onChange={(e) => setEditType(e.target.value)} className={inputClass}>
              <option value="TEMPLATE">Template</option>
              <option value="COMPONENT">Component</option>
              <option value="FULL_APPLICATION">Full Application</option>
              <option value="PLUGIN">Plugin</option>
              <option value="DESIGN_ASSET">Design Asset</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Price *</label>
              <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Sale Price</label>
              <input type="number" step="0.01" value={editSalePrice} onChange={(e) => setEditSalePrice(e.target.value)} className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Currency</label>
              <input type="text" value={editCurrency} onChange={(e) => setEditCurrency(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">License</label>
            <select value={editLicenseType} onChange={(e) => setEditLicenseType(e.target.value)} className={inputClass}>
              <option value="PERSONAL">Personal</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="EXTENDED">Extended</option>
            </select>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={editIsActive} onChange={(e) => setEditIsActive(e.target.checked)} className="h-4 w-4 rounded border-foreground/20 text-primary-600 focus:ring-primary-500/30" />
              <span className="text-sm font-medium text-foreground">Active</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={editIsFeatured} onChange={(e) => setEditIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-foreground/20 text-primary-600 focus:ring-primary-500/30" />
              <span className="text-sm font-medium text-foreground">Featured</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
