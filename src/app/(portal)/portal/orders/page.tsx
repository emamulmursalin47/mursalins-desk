"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/portal/status-badge";
import { EmptyState } from "@/components/portal/empty-state";
import { Pagination } from "@/components/dashboard/pagination";
import type { Order, PaginatedResult } from "@/types/api";

const TABS = ["All", "PENDING", "PROCESSING", "COMPLETED", "CANCELLED", "REFUNDED"] as const;

const EMPTY_MESSAGES: Record<string, string> = {
  All: "You don't have any orders yet.",
  PENDING: "No pending orders.",
  PROCESSING: "No orders being processed.",
  COMPLETED: "No completed orders.",
  CANCELLED: "No cancelled orders.",
  REFUNDED: "No refunded orders.",
};

async function fetchOrders(
  page: number,
  status?: string,
  search?: string,
): Promise<PaginatedResult<Order>> {
  const params = new URLSearchParams({ page: String(page), limit: "12" });
  if (status && status !== "All") params.set("status", status);
  if (search) params.set("search", search);
  const res = await fetch(`/api/proxy/orders?${params}`);
  if (!res.ok) throw new Error("Failed to load orders");
  const json = await res.json();
  return json.data ?? json;
}

export default function MyOrdersPage() {
  const [data, setData] = useState<PaginatedResult<Order> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchOrders(page, tab, search);
      setData(result);
    } catch {
      /* toast could go here */
    } finally {
      setLoading(false);
    }
  }, [page, tab, search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View your order history and track status.
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search orders..."
          className="glass h-10 w-full rounded-xl border-0 pl-10 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
        {searchInput && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1">
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
            {t === "All" ? "All Orders" : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass animate-pulse rounded-2xl p-5">
              <div className="h-4 w-32 rounded bg-muted/60" />
              <div className="mt-3 h-6 w-24 rounded bg-muted/60" />
              <div className="mt-3 h-3 w-48 rounded bg-muted/40" />
            </div>
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState message={EMPTY_MESSAGES[tab] ?? "No orders found."} />
      ) : (
        <>
          <div className="space-y-4">
            {data.data.map((order) => {
              const discount = Number(order.discountAmount ?? 0);
              return (
                <Link
                  key={order.id}
                  href={`/portal/orders/${order.id}`}
                  className="glass glass-shine block rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {order.currency}{" "}
                        {Number(order.totalAmount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        {discount > 0 && (
                          <span className="ml-2 text-sm font-normal text-success">
                            Saved ${discount.toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {order.items.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{item.productName}</span>
                          <span className="text-muted-foreground">
                            {order.currency}{" "}
                            {Number(item.price).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {order.coupon && (
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                        Coupon: {order.coupon.code}
                      </span>
                    </div>
                  )}

                  {order.status === "CANCELLED" && order.cancellationReason && (
                    <p className="mt-2 truncate text-xs text-destructive">
                      Reason: {order.cancellationReason}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <div className="flex items-center gap-3">
                      {order.status === "COMPLETED" && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-500">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          Review
                        </span>
                      )}
                      <span className="text-xs font-medium text-primary-600">
                        View Details &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {data.meta && (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
