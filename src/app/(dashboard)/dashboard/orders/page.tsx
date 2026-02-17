"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminPatch } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Pagination } from "@/components/dashboard/pagination";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { LoadingState } from "@/components/dashboard/loading-state";
import { SearchInput } from "@/components/dashboard/search-input";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { useToast } from "@/components/dashboard/toast-context";
import type { AdminOrder, OrderStats } from "@/types/admin";
import type { PaginatedResult } from "@/types/api";

const TABS = [
  "All",
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;

const STATUS_DOT: Record<string, string> = {
  PENDING: "bg-accent-500",
  PROCESSING: "bg-info",
  COMPLETED: "bg-success",
  CANCELLED: "bg-destructive",
  REFUNDED: "bg-warning",
};

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<PaginatedResult<AdminOrder> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AdminOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const buildQuery = useCallback(
    (extra: Record<string, string> = {}) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (tab !== "All") params.set("status", tab);
      if (search) params.set("search", search);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (sortBy) params.set("sortBy", sortBy);
      if (sortOrder) params.set("sortOrder", sortOrder);
      for (const [k, v] of Object.entries(extra)) params.set(k, v);
      return params.toString();
    },
    [page, tab, search, dateFrom, dateTo, sortBy, sortOrder],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminGet<PaginatedResult<AdminOrder>>(
        `/orders/admin/all?${buildQuery()}`,
      );
      setData(result);
    } catch {
      toast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const q = params.toString();
      const result = await adminGet<OrderStats>(
        `/orders/admin/stats${q ? `?${q}` : ""}`,
      );
      setStats(result);
    } catch {
      toast("Failed to load stats", "error");
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
        onComplete() {
          gsap.set(items, { clearProps: "transform,opacity" });
        },
      });
    },
    { dependencies: [loading], scope: containerRef },
  );

  async function quickStatusUpdate(orderId: string, status: string) {
    setActionLoading(true);
    try {
      await adminPatch(`/orders/${orderId}/status`, { status });
      toast(`Order ${status.toLowerCase()}`, "success");
      fetchData();
      fetchStats();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancelConfirm() {
    if (!cancelTarget) return;
    setActionLoading(true);
    try {
      await adminPatch(`/orders/${cancelTarget.id}/status`, {
        status: "CANCELLED",
        reason: cancelReason || undefined,
      });
      toast("Order cancelled", "success");
      setShowCancelConfirm(false);
      setCancelTarget(null);
      setCancelReason("");
      fetchData();
      fetchStats();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to cancel", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/proxy/orders/admin/export?${buildQuery()}`);
      if (!res.ok) throw new Error("Export failed");
      const csv = await res.text();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast("CSV exported", "success");
    } catch {
      toast("Failed to export", "error");
    } finally {
      setExporting(false);
    }
  }

  const columns: Column<AdminOrder>[] = [
    {
      key: "id",
      label: "Order",
      render: (r) => {
        const dotColor = STATUS_DOT[r.status] ?? "bg-muted-foreground";
        return (
          <span className="inline-flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
            <span className="font-mono text-xs">#{r.id.slice(-8)}</span>
          </span>
        );
      },
    },
    {
      key: "user",
      label: "Customer",
      render: (r) =>
        r.user
          ? `${r.user.firstName ?? ""} ${r.user.lastName ?? ""}`.trim() ||
            r.user.email
          : "\u2014",
    },
    {
      key: "items",
      label: "Items",
      render: (r) => (
        <span className="text-muted-foreground">
          {r.items.length} item{r.items.length !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "totalAmount",
      label: "Total",
      render: (r) => {
        const discount = Number(r.discountAmount ?? 0);
        return (
          <div>
            <span>
              {r.currency}{" "}
              {Number(r.totalAmount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            {discount > 0 && (
              <span className="ml-1.5 text-xs text-success">
                (-${discount.toFixed(2)})
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "createdAt",
      label: "Date",
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
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {r.status === "PENDING" && (
            <button
              onClick={() => quickStatusUpdate(r.id, "PROCESSING")}
              disabled={actionLoading}
              className="rounded-lg bg-info/10 px-2.5 py-1 text-xs font-medium text-info transition-colors hover:bg-info/20 disabled:opacity-50"
            >
              Process
            </button>
          )}
          {r.status === "PROCESSING" && (
            <button
              onClick={() => quickStatusUpdate(r.id, "COMPLETED")}
              disabled={actionLoading}
              className="rounded-lg bg-success/10 px-2.5 py-1 text-xs font-medium text-success transition-colors hover:bg-success/20 disabled:opacity-50"
            >
              Complete
            </button>
          )}
          {(r.status === "PENDING" || r.status === "PROCESSING") && (
            <button
              onClick={() => {
                setCancelTarget(r);
                setShowCancelConfirm(true);
              }}
              disabled={actionLoading}
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div ref={containerRef}>
      <PageHeader
        title="Orders"
        description="Manage customer orders."
        action={
          <button
            onClick={handleExport}
            disabled={exporting}
            className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        }
      />

      {/* Stats Row */}
      {stats && (
        <div
          data-animate
          className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <StatsCard
            label="Total Orders"
            value={stats.totalOrders}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            }
          />
          <StatsCard
            label="Pending"
            value={stats.pendingCount}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
          <StatsCard
            label="Processing"
            value={stats.processingCount}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            }
          />
          <StatsCard
            label="Completed"
            value={stats.completedCount}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
          />
          <StatsCard
            label="Revenue"
            value={stats.totalRevenue}
            prefix="$"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
        </div>
      )}

      {/* Toolbar */}
      <div data-animate className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-64">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search orders..."
          />
        </div>
        <DateRangePicker
          dateFrom={dateFrom}
          dateTo={dateTo}
          onChange={(from, to) => {
            setDateFrom(from);
            setDateTo(to);
            setPage(1);
          }}
        />
        <select
          value={`${sortBy}:${sortOrder}`}
          onChange={(e) => {
            const parts = e.target.value.split(":");
            setSortBy(parts[0] ?? "createdAt");
            setSortOrder(parts[1] ?? "desc");
            setPage(1);
          }}
          className="glass h-10 rounded-xl border-0 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="totalAmount:desc">Highest value</option>
          <option value="totalAmount:asc">Lowest value</option>
        </select>
      </div>

      {/* Tabs */}
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
            {t === "All" ? "All" : t}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState />
      ) : (
        <div data-animate>
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => router.push(`/dashboard/orders/${r.id}`)}
            emptyMessage="No orders found."
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

      {/* Cancel Confirm */}
      <ConfirmDialog
        open={showCancelConfirm}
        onClose={() => {
          setShowCancelConfirm(false);
          setCancelTarget(null);
          setCancelReason("");
        }}
        onConfirm={handleCancelConfirm}
        title="Cancel Order"
        message={
          <div>
            <p className="mb-3">
              Are you sure you want to cancel order #{cancelTarget?.id.slice(-8)}?
              This action cannot be undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              rows={3}
              className="glass w-full rounded-xl border-0 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
        }
        confirmLabel="Cancel Order"
        loading={actionLoading}
      />
    </div>
  );
}
