"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/portal/status-badge";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import type { Order } from "@/types/api";
import type { OrderStatusHistory } from "@/types/admin";

const PROGRESS_STEPS = ["PENDING", "PROCESSING", "COMPLETED"] as const;

const STATUS_HELP: Record<string, { title: string; description: string }> = {
  PENDING: {
    title: "Order Received",
    description: "Your order is being reviewed. You\u2019ll be notified when processing begins.",
  },
  PROCESSING: {
    title: "Being Prepared",
    description: "Your order is being prepared. Download links will be available once completed.",
  },
  COMPLETED: {
    title: "Order Complete",
    description: "Your order is complete! Check your email for download links and license details.",
  },
  CANCELLED: {
    title: "Order Cancelled",
    description: "This order has been cancelled. If you believe this was an error, please contact support.",
  },
  REFUNDED: {
    title: "Order Refunded",
    description: "This order has been refunded. The amount will be returned to your original payment method.",
  },
};

const LICENSE_LABELS: Record<string, string> = {
  PERSONAL: "Personal License",
  COMMERCIAL: "Commercial License",
  EXTENDED: "Extended License",
};

async function fetchOrder(id: string): Promise<Order | null> {
  const res = await fetch(`/api/proxy/orders/${id}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? json;
}

async function fetchHistory(id: string): Promise<OrderStatusHistory[]> {
  const res = await fetch(`/api/proxy/orders/${id}/history`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? json;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<OrderStatusHistory[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder(id).then((data) => {
      if (!data) {
        router.replace("/portal/orders");
        return;
      }
      setOrder(data);
      setLoading(false);
    });
    fetchHistory(id).then(setHistory).catch(() => {});
  }, [id, router]);

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch(`/api/proxy/orders/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to cancel");
      }
      // Re-fetch order and history
      const [updated, newHistory] = await Promise.all([
        fetchOrder(id),
        fetchHistory(id),
      ]);
      if (updated) setOrder(updated);
      setHistory(newHistory);
      setShowCancelModal(false);
      setCancelReason("");
    } catch {
      // Could add a toast here
    } finally {
      setCancelling(false);
    }
  }

  if (loading || !order) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 animate-pulse rounded bg-muted/60" />
          <div className="h-4 w-4 animate-pulse rounded bg-muted/40" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted/60" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-48 animate-pulse rounded bg-muted/60" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted/40" />
        </div>
        <div className="glass animate-pulse rounded-2xl p-5">
          <div className="h-12 rounded bg-muted/40" />
          <div className="mt-4 h-16 rounded-xl bg-muted/30" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="glass animate-pulse rounded-2xl p-6 lg:col-span-2">
            <div className="h-5 w-28 rounded bg-muted/60" />
            <div className="mt-4 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-muted/30" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="glass animate-pulse rounded-2xl p-5">
              <div className="h-4 w-16 rounded bg-muted/60" />
              <div className="mt-3 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 rounded bg-muted/30" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stepIdx = PROGRESS_STEPS.indexOf(order.status as (typeof PROGRESS_STEPS)[number]);
  const isTerminal = order.status === "CANCELLED" || order.status === "REFUNDED";
  const help = STATUS_HELP[order.status] ?? STATUS_HELP["PENDING"]!;
  const subtotal = order.items.reduce((sum, item) => sum + Number(item.price), 0);
  const discount = Number(order.discountAmount ?? 0);
  const firstProductSlug = order.items[0]?.product?.slug;

  // Build "what happens next" description with reason
  let helpDescription = help.description;
  if (order.status === "CANCELLED" && order.cancellationReason) {
    helpDescription = `Reason: ${order.cancellationReason}. ${help.description}`;
  }
  if (order.status === "REFUNDED" && order.refundReason) {
    helpDescription = `Reason: ${order.refundReason}. ${help.description}`;
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground">
        <Link href="/portal/orders" className="shrink-0 transition-colors hover:text-foreground">
          My Orders
        </Link>
        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="truncate font-medium text-foreground">
          Order #{order.id.slice(-8).toUpperCase()}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[28px] font-bold tracking-tight text-foreground">
          Order #{order.id.slice(-8).toUpperCase()}
        </h1>
        <StatusBadge status={order.status} />
      </div>

      {/* Progress Timeline */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between">
          {PROGRESS_STEPS.map((step, i) => {
            const filled = !isTerminal && stepIdx >= i;
            const isCurrent = !isTerminal && stepIdx === i;
            return (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      filled
                        ? isCurrent
                          ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                          : "bg-primary-500/20 text-primary-600"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {filled && !isCurrent ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={`text-xs font-medium ${filled ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.charAt(0) + step.slice(1).toLowerCase()}
                  </span>
                </div>
                {i < PROGRESS_STEPS.length - 1 && (
                  <div className="mx-2 h-0.5 flex-1">
                    <div className={`h-full rounded-full transition-colors ${!isTerminal && stepIdx > i ? "bg-primary-500/40" : "bg-muted/40"}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={`mt-4 rounded-xl px-4 py-3 ${isTerminal ? "bg-destructive/5 text-destructive" : "bg-primary-50 text-primary-700"}`}>
          <p className="text-sm font-semibold">{help.title}</p>
          <p className="mt-0.5 text-[13px] opacity-80">{helpDescription}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="space-y-6 lg:col-span-2">
          <div className="glass rounded-2xl p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="rounded-xl bg-muted/30 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.product?.slug ? (
                          <Link href={`/store/${item.product.slug}`} className="text-primary-600 transition-colors hover:text-primary-500">
                            {item.productName}
                          </Link>
                        ) : (
                          item.productName
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {LICENSE_LABELS[item.licenseType] || item.licenseType}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  </div>
                  {order.status === "COMPLETED" && item.product?.slug && (
                    <Link
                      href={`/store/${item.product.slug}#reviews`}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent-500 transition-colors hover:text-accent-600"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Leave a Review
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 border-t border-glass-border pt-4">
              {discount > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-success">
                      Discount
                      {order.coupon && (
                        <span className="ml-1.5 inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium">
                          {order.coupon.code}
                        </span>
                      )}
                    </span>
                    <span className="text-success">-${discount.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 border-t border-glass-border pt-2" />
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">
                  ${Number(order.totalAmount).toFixed(2)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">{order.currency}</span>
                </span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-4 rounded-xl bg-muted/30 px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">Order Notes</p>
                <p className="mt-1 text-sm text-foreground">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Cancel / Re-order Actions */}
          {order.status === "PENDING" && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full rounded-xl border border-destructive/20 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              Cancel Order
            </button>
          )}

          {order.status === "COMPLETED" && firstProductSlug && (
            <Link
              href={`/store/${firstProductSlug}`}
              className="glass glass-shine block rounded-xl px-4 py-3 text-center text-sm font-medium text-primary-600 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Re-order &rarr;
            </Link>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Payment */}
          {order.payment && (
            <div className="glass rounded-2xl p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Payment</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Provider</dt>
                  <dd className="font-medium text-foreground">{order.payment.provider}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Amount</dt>
                  <dd className="font-medium text-foreground">
                    {order.payment.currency} {Number(order.payment.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Status</dt>
                  <dd><StatusBadge status={order.payment.status} /></dd>
                </div>
              </dl>
            </div>
          )}

          {/* Activity Timeline */}
          {history.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Activity</h3>
              <ActivityTimeline history={history} showAdmin={false} />
            </div>
          )}

          {/* Order Info */}
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Order Info</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Order ID</dt>
                <dd className="break-all font-mono text-xs text-foreground">{order.id}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Placed</dt>
                <dd className="font-medium text-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}{" "}
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Last Updated</dt>
                <dd className="font-medium text-foreground">
                  {new Date(order.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}{" "}
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Help */}
          <div className="glass-subtle rounded-2xl p-5">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Need Help?</h3>
            <p className="text-[13px] text-muted-foreground">
              If you have questions about your order, please{" "}
              <Link href="/contact" className="text-primary-600 transition-colors hover:text-primary-500">
                contact us
              </Link>{" "}
              with your order ID.
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass w-full max-w-md rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">Cancel Order</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to cancel order #{order.id.slice(-8).toUpperCase()}? This action cannot be undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              rows={3}
              className="glass mt-4 w-full rounded-xl border-0 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(""); }}
                className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Go Back
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
