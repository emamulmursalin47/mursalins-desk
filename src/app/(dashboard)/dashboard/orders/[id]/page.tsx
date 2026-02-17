"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminPatch, adminPost } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Modal } from "@/components/dashboard/modal";
import { LoadingState } from "@/components/dashboard/loading-state";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { useToast } from "@/components/dashboard/toast-context";
import type { AdminOrder, OrderNote, OrderStatusHistory } from "@/types/admin";

const PROGRESS_STEPS = ["PENDING", "PROCESSING", "COMPLETED"] as const;

function stepIndex(status: string) {
  const idx = PROGRESS_STEPS.indexOf(status as (typeof PROGRESS_STEPS)[number]);
  return idx === -1 ? -1 : idx;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [refundReason, setRefundReason] = useState("");

  // Notes state
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [noteInternal, setNoteInternal] = useState(true);
  const [addingNote, setAddingNote] = useState(false);

  // Payment state
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [showPaymentEdit, setShowPaymentEdit] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // History state
  const [history, setHistory] = useState<OrderStatusHistory[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    adminGet<AdminOrder>(`/orders/admin/${id}`)
      .then(setOrder)
      .catch(() => router.push("/dashboard/orders"))
      .finally(() => setLoading(false));

    adminGet<OrderNote[]>(`/orders/admin/${id}/notes`).then(setNotes).catch(() => {});
    adminGet<OrderStatusHistory[]>(`/orders/admin/${id}/history`).then(setHistory).catch(() => {});
  }, [id, router]);

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

  async function updateStatus(status: string, reason?: string) {
    setUpdating(true);
    try {
      await adminPatch(`/orders/${id}/status`, { status, reason: reason || undefined });
      // Re-fetch order and history
      const [updated, newHistory] = await Promise.all([
        adminGet<AdminOrder>(`/orders/admin/${id}`),
        adminGet<OrderStatusHistory[]>(`/orders/admin/${id}/history`),
      ]);
      setOrder(updated);
      setHistory(newHistory);
      toast(`Order ${status.toLowerCase()}`, "success");
      return true;
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update", "error");
      return false;
    } finally {
      setUpdating(false);
    }
  }

  async function handleCancel() {
    const ok = await updateStatus("CANCELLED", cancelReason);
    if (ok) {
      setShowCancel(false);
      setCancelReason("");
    }
  }

  async function handleRefund() {
    const ok = await updateStatus("REFUNDED", refundReason);
    if (ok) {
      setShowRefund(false);
      setRefundReason("");
    }
  }

  async function handleAddNote() {
    if (!noteContent.trim()) return;
    setAddingNote(true);
    try {
      const note = await adminPost<OrderNote>(`/orders/admin/${id}/notes`, {
        content: noteContent,
        isInternal: noteInternal,
      });
      setNotes((prev) => [note, ...prev]);
      setNoteContent("");
      toast("Note added", "success");
    } catch {
      toast("Failed to add note", "error");
    } finally {
      setAddingNote(false);
    }
  }

  async function handleUpdatePayment() {
    if (!paymentStatus) return;
    setUpdatingPayment(true);
    try {
      await adminPatch(`/orders/admin/${id}/payment`, {
        status: paymentStatus,
        transactionId: transactionId || undefined,
      });
      const updated = await adminGet<AdminOrder>(`/orders/admin/${id}`);
      setOrder(updated);
      setShowPaymentEdit(false);
      setPaymentStatus("");
      setTransactionId("");
      toast("Payment status updated", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update payment", "error");
    } finally {
      setUpdatingPayment(false);
    }
  }

  function copyOrderId() {
    if (!order) return;
    navigator.clipboard.writeText(order.id).then(() => {
      toast("Order ID copied", "success");
    });
  }

  if (loading) return <LoadingState />;
  if (!order) return null;

  const currentStep = stepIndex(order.status);
  const isTerminal = order.status === "CANCELLED" || order.status === "REFUNDED";
  const subtotal = order.items.reduce((sum, item) => sum + Number(item.price), 0);
  const discount = Number(order.discountAmount ?? 0);

  return (
    <div ref={containerRef}>
      <PageHeader
        title={`Order #${order.id.slice(-8)}`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={copyOrderId}
              className="btn-glass-secondary inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium"
              title="Copy full order ID"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy ID
            </button>
            <button
              onClick={() => router.push("/dashboard/orders")}
              className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium"
            >
              &larr; Back
            </button>
          </div>
        }
      />

      {/* Progress Timeline */}
      <div data-animate className="glass mb-6 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          {PROGRESS_STEPS.map((step, i) => {
            const filled = !isTerminal && currentStep >= i;
            const isCurrent = !isTerminal && currentStep === i;
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
                    <div className={`h-full rounded-full transition-colors ${!isTerminal && currentStep > i ? "bg-primary-500/40" : "bg-muted/40"}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {isTerminal && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-warning/10 px-3 py-2 text-sm text-warning">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            This order has been <span className="font-semibold">{order.status.toLowerCase()}</span>
            {order.status === "CANCELLED" && order.cancellationReason && (
              <span className="text-muted-foreground"> &mdash; {order.cancellationReason}</span>
            )}
            {order.status === "REFUNDED" && order.refundReason && (
              <span className="text-muted-foreground"> &mdash; {order.refundReason}</span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div data-animate className="glass rounded-2xl p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-glass-border">
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">License</th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-3 font-medium text-foreground">
                        {item.product?.slug ? (
                          <Link href={`/store/${item.product.slug}`} className="text-primary-600 hover:text-primary-500 transition-colors">
                            {item.productName}
                          </Link>
                        ) : (
                          item.productName
                        )}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{item.licenseType}</td>
                      <td className="px-3 py-3 text-right text-foreground">
                        {order.currency} {Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {discount > 0 && (
                    <>
                      <tr className="border-t border-glass-border">
                        <td colSpan={2} className="px-3 py-2 text-right text-sm text-muted-foreground">Subtotal</td>
                        <td className="px-3 py-2 text-right text-foreground">
                          {order.currency} {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="px-3 py-2 text-right text-sm text-success">
                          Discount
                          {order.coupon && (
                            <span className="ml-1.5 inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                              {order.coupon.code}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right text-success">
                          -{order.currency} {discount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="border-t border-glass-border">
                    <td colSpan={2} className="px-3 py-3 text-right font-semibold text-foreground">Total</td>
                    <td className="px-3 py-3 text-right font-bold text-foreground">
                      {order.currency} {Number(order.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {order.notes && (
              <div className="mt-4 rounded-xl bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">Customer Notes</p>
                <p className="mt-1 text-sm text-foreground">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Admin Notes */}
          <div data-animate className="glass rounded-2xl p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Notes</h2>

            {/* Add Note Form */}
            <div className="mb-4 space-y-3">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="glass w-full rounded-xl border-0 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={noteInternal}
                    onChange={(e) => setNoteInternal(e.target.checked)}
                    className="rounded border-glass-border"
                  />
                  Internal only
                </label>
                <button
                  onClick={handleAddNote}
                  disabled={addingNote || !noteContent.trim()}
                  className="btn-glass-primary rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {addingNote ? "Adding..." : "Add Note"}
                </button>
              </div>
            </div>

            {/* Notes List */}
            {notes.length > 0 ? (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-xl bg-muted/20 p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {note.author.firstName} {note.author.lastName}
                      </span>
                      <span>&middot;</span>
                      <span>{new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                      {note.isInternal && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                          Internal
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-foreground">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">No notes yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div data-animate className="space-y-4">
          {/* Actions */}
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Actions</h3>
            <div className="flex flex-col gap-2">
              {order.status === "PENDING" && (
                <>
                  <button onClick={() => updateStatus("PROCESSING")} disabled={updating} className="btn-glass-primary w-full rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                    Start Processing
                  </button>
                  <button onClick={() => setShowCancel(true)} className="w-full rounded-xl border border-destructive/20 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
                    Cancel Order
                  </button>
                </>
              )}
              {order.status === "PROCESSING" && (
                <>
                  <button onClick={() => updateStatus("COMPLETED")} disabled={updating} className="btn-glass-primary w-full rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                    Mark Completed
                  </button>
                  <button onClick={() => setShowCancel(true)} className="w-full rounded-xl border border-destructive/20 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
                    Cancel Order
                  </button>
                </>
              )}
              {order.status === "COMPLETED" && (
                <button onClick={() => setShowRefund(true)} className="w-full rounded-xl border border-warning/20 px-4 py-2 text-sm font-medium text-warning transition-colors hover:bg-warning/10">
                  Issue Refund
                </button>
              )}
              {isTerminal && (
                <p className="text-center text-xs text-muted-foreground">No actions available</p>
              )}
            </div>
          </div>

          {/* Payment */}
          {order.payment && (
            <div className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Payment</h3>
                {!showPaymentEdit && (
                  <button
                    onClick={() => {
                      setPaymentStatus(order.payment!.status);
                      setTransactionId(order.payment!.transactionId ?? "");
                      setShowPaymentEdit(true);
                    }}
                    className="text-xs text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
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
                {order.payment.transactionId && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Transaction ID</dt>
                    <dd className="font-mono text-xs text-foreground break-all">{order.payment.transactionId}</dd>
                  </div>
                )}
              </dl>

              {showPaymentEdit && (
                <div className="mt-4 space-y-3 border-t border-glass-border pt-4">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Payment Status</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="glass w-full rounded-xl border-0 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="SUCCEEDED">Succeeded</option>
                      <option value="FAILED">Failed</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Transaction ID</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. pi_3abc..."
                      className="glass w-full rounded-xl border-0 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowPaymentEdit(false); setPaymentStatus(""); setTransactionId(""); }}
                      className="btn-glass-secondary flex-1 rounded-xl px-3 py-2 text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdatePayment}
                      disabled={updatingPayment || paymentStatus === order.payment!.status && transactionId === (order.payment!.transactionId ?? "")}
                      className="btn-glass-primary flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {updatingPayment ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer */}
          {order.user && (
            <div className="glass rounded-2xl p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Customer</h3>
              <p className="text-sm font-medium text-foreground">
                {`${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim() || "\u2014"}
              </p>
              <a href={`mailto:${order.user.email}`} className="text-xs text-primary-600 hover:text-primary-500 transition-colors">
                {order.user.email}
              </a>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">{order.user.id}</p>
            </div>
          )}

          {/* Coupon */}
          {order.coupon && (
            <div className="glass rounded-2xl p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Coupon Applied</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Code</dt>
                  <dd className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                    {order.coupon.code}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Discount</dt>
                  <dd className="font-medium text-foreground">
                    {order.coupon.discountType === "PERCENTAGE"
                      ? `${Number(order.coupon.discountValue)}%`
                      : `$${Number(order.coupon.discountValue).toFixed(2)}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Saved</dt>
                  <dd className="font-medium text-success">
                    -${discount.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Activity Timeline */}
          {history.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Activity</h3>
              <ActivityTimeline history={history} showAdmin />
            </div>
          )}

          {/* Timeline */}
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Timeline</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Created</dt>
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
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        open={showCancel}
        onClose={() => { setShowCancel(false); setCancelReason(""); }}
        title="Cancel Order"
        footer={
          <>
            <button onClick={() => { setShowCancel(false); setCancelReason(""); }} className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium">
              Go Back
            </button>
            <button onClick={handleCancel} disabled={updating} className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50">
              {updating ? "Cancelling..." : "Cancel Order"}
            </button>
          </>
        }
      >
        <p className="mb-3 text-muted-foreground">
          Are you sure you want to cancel order <span className="font-semibold text-foreground">#{order.id.slice(-8)}</span>? This action cannot be undone.
        </p>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Reason for cancellation (required)"
          rows={3}
          className="glass w-full rounded-xl border-0 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </Modal>

      {/* Refund Modal */}
      <Modal
        open={showRefund}
        onClose={() => { setShowRefund(false); setRefundReason(""); }}
        title="Issue Refund"
        footer={
          <>
            <button onClick={() => { setShowRefund(false); setRefundReason(""); }} className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium">
              Go Back
            </button>
            <button onClick={handleRefund} disabled={updating} className="rounded-xl bg-warning px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50">
              {updating ? "Processing..." : "Issue Refund"}
            </button>
          </>
        }
      >
        <p className="mb-3 text-muted-foreground">
          Are you sure you want to refund order <span className="font-semibold text-foreground">#{order.id.slice(-8)}</span> for{" "}
          <span className="font-semibold text-foreground">
            {order.currency} {Number(order.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          ? This action cannot be undone.
        </p>
        <textarea
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
          placeholder="Reason for refund (optional)"
          rows={3}
          className="glass w-full rounded-xl border-0 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </Modal>
    </div>
  );
}
