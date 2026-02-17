"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminPatch } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Modal } from "@/components/dashboard/modal";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useToast } from "@/components/dashboard/toast-context";
import type { AdminAppointment } from "@/types/admin";

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [appt, setAppt] = useState<AdminAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    adminGet<AdminAppointment>(`/appointments/${id}`)
      .then(setAppt)
      .catch(() => router.push("/dashboard/appointments"))
      .finally(() => setLoading(false));
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
        onComplete() { gsap.set(items, { clearProps: "transform,opacity" }); },
      });
    },
    { dependencies: [loading], scope: containerRef },
  );

  async function updateStatus(status: string) {
    setUpdating(true);
    try {
      await adminPatch(`/appointments/${id}`, { status });
      setAppt((prev) => (prev ? { ...prev, status: status as AdminAppointment["status"] } : prev));
      toast(`Appointment ${status.toLowerCase()}`, "success");
    } catch {
      toast("Failed to update", "error");
    } finally {
      setUpdating(false);
    }
  }

  async function handleCancel() {
    setUpdating(true);
    try {
      await adminPatch(`/appointments/${id}/cancel`, {
        reason: cancelReason || undefined,
      });
      setAppt((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
      setShowCancel(false);
      toast("Appointment cancelled", "success");
    } catch {
      toast("Failed to cancel", "error");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!appt) return null;

  return (
    <div ref={containerRef}>
      <PageHeader
        title="Appointment Details"
        action={
          <button
            onClick={() => router.push("/dashboard/appointments")}
            className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium"
          >
            &larr; Back
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div data-animate className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              {appt.name}
            </h2>
            <StatusBadge status={appt.status} />
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </dt>
              <dd className="mt-1 text-sm text-foreground">{appt.email}</dd>
            </div>
            {appt.phone && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Phone
                </dt>
                <dd className="mt-1 text-sm text-foreground">{appt.phone}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Date & Time
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {new Date(appt.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Duration
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {appt.duration} minutes
              </dd>
            </div>
            {appt.topic && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Topic
                </dt>
                <dd className="mt-1 text-sm text-foreground">{appt.topic}</dd>
              </div>
            )}
            {appt.notes && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Notes
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                  {appt.notes}
                </dd>
              </div>
            )}
            {appt.timezone && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Timezone
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {appt.timezone}
                </dd>
              </div>
            )}
            {appt.meetingUrl && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Meeting URL
                </dt>
                <dd className="mt-1 text-sm">
                  <a
                    href={appt.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Join Meeting
                  </a>
                </dd>
              </div>
            )}
            {appt.cancelReason && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wider text-destructive">
                  Cancel Reason
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {appt.cancelReason}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Actions */}
        <div data-animate className="glass rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Actions
          </h3>
          <div className="flex flex-col gap-2">
            {appt.status === "PENDING" && (
              <button
                onClick={() => updateStatus("CONFIRMED")}
                disabled={updating}
                className="btn-glass-primary w-full rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Confirm
              </button>
            )}
            {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
              <button
                onClick={() => updateStatus("COMPLETED")}
                disabled={updating}
                className="btn-glass-secondary w-full rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                Mark Completed
              </button>
            )}
            {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
              <button
                onClick={() => setShowCancel(true)}
                className="w-full rounded-xl border border-destructive/20 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                Cancel Appointment
              </button>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        title="Cancel Appointment"
        footer={
          <>
            <button
              onClick={() => setShowCancel(false)}
              className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium"
            >
              Go Back
            </button>
            <button
              onClick={handleCancel}
              disabled={updating}
              className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            >
              {updating ? "Cancelling..." : "Cancel Appointment"}
            </button>
          </>
        }
      >
        <p className="mb-3 text-muted-foreground">
          Optionally provide a reason for cancellation:
        </p>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          rows={3}
          className="glass-subtle w-full resize-none rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30 placeholder:text-muted-foreground"
          placeholder="Reason for cancellation..."
        />
      </Modal>
    </div>
  );
}
