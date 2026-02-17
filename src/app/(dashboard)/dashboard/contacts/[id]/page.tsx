"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminPatch, adminDelete } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useToast } from "@/components/dashboard/toast-context";
import type { Contact } from "@/types/admin";

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    adminGet<Contact>(`/contact/${id}`)
      .then(setContact)
      .catch(() => router.push("/dashboard/contacts"))
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

  async function markRead() {
    try {
      await adminPatch(`/contact/${id}/read`);
      setContact((prev) => (prev ? { ...prev, status: "READ" } : prev));
      toast("Marked as read", "success");
    } catch {
      toast("Failed to update", "error");
    }
  }

  async function markReplied() {
    try {
      await adminPatch(`/contact/${id}/replied`);
      setContact((prev) => (prev ? { ...prev, status: "REPLIED" } : prev));
      toast("Marked as replied", "success");
    } catch {
      toast("Failed to update", "error");
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await adminDelete(`/contact/${id}`);
      toast("Contact deleted", "success");
      router.push("/dashboard/contacts");
    } catch {
      toast("Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!contact) return null;

  return (
    <div ref={containerRef}>
      <PageHeader
        title="Contact Details"
        action={
          <button
            onClick={() => router.push("/dashboard/contacts")}
            className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium"
          >
            &larr; Back
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Message */}
        <div data-animate className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              {contact.subject || "No Subject"}
            </h2>
            <StatusBadge status={contact.status} />
          </div>
          <div className="prose max-w-none text-sm leading-relaxed text-foreground">
            <p className="whitespace-pre-wrap">{contact.message}</p>
          </div>
        </div>

        {/* Info Sidebar */}
        <div data-animate className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Contact Info
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Name</dt>
                <dd className="font-medium text-foreground">{contact.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="font-medium text-foreground">{contact.email}</dd>
              </div>
              {contact.phone && (
                <div>
                  <dt className="text-xs text-muted-foreground">Phone</dt>
                  <dd className="font-medium text-foreground">
                    {contact.phone}
                  </dd>
                </div>
              )}
              {contact.budget && (
                <div>
                  <dt className="text-xs text-muted-foreground">Budget</dt>
                  <dd className="font-medium text-foreground">
                    {contact.budget}
                  </dd>
                </div>
              )}
              {contact.timeline && (
                <div>
                  <dt className="text-xs text-muted-foreground">Timeline</dt>
                  <dd className="font-medium text-foreground">
                    {contact.timeline}
                  </dd>
                </div>
              )}
              {contact.source && (
                <div>
                  <dt className="text-xs text-muted-foreground">Source</dt>
                  <dd className="font-medium text-foreground">
                    {contact.source}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-muted-foreground">Submitted</dt>
                <dd className="font-medium text-foreground">
                  {new Date(contact.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Actions
            </h3>
            <div className="flex flex-col gap-2">
              {contact.status === "NEW" && (
                <button
                  onClick={markRead}
                  className="btn-glass-secondary w-full rounded-xl px-4 py-2 text-sm font-medium"
                >
                  Mark as Read
                </button>
              )}
              {(contact.status === "NEW" || contact.status === "READ") && (
                <button
                  onClick={markReplied}
                  className="btn-glass-primary w-full rounded-xl px-4 py-2 text-sm font-semibold text-white"
                >
                  Mark as Replied
                </button>
              )}
              <button
                onClick={() => setShowDelete(true)}
                className="w-full rounded-xl border border-destructive/20 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Contact"
        message="Are you sure you want to delete this contact submission? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
