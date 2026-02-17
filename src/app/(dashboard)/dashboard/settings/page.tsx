"use client";

import { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminPut, adminDelete } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { FormField } from "@/components/dashboard/form-field";
import { Modal } from "@/components/dashboard/modal";
import { LoadingState } from "@/components/dashboard/loading-state";
import { useToast } from "@/components/dashboard/toast-context";
import type { SiteSetting } from "@/types/api";

interface DbStats {
  users: number;
  orders: number;
  contacts: number;
  appointments: number;
  testimonials: number;
  products: number;
  projects: number;
  posts: number;
  newsletter: number;
  pageViews: number;
  coupons: number;
  reviews: number;
  faq: number;
  auditLogs: number;
}

const TABLE_LABELS: Record<string, string> = {
  orders: "Orders",
  contacts: "Contacts",
  appointments: "Appointments",
  testimonials: "Testimonials",
  products: "Products",
  projects: "Projects",
  posts: "Blog Posts",
  newsletter: "Newsletter",
  analytics: "Analytics",
  coupons: "Coupons",
  reviews: "Reviews",
  faq: "FAQs",
  auditLogs: "Audit Logs",
};

const STATS_TO_TABLE: Record<string, string> = {
  orders: "orders",
  contacts: "contacts",
  appointments: "appointments",
  testimonials: "testimonials",
  products: "products",
  projects: "projects",
  posts: "posts",
  newsletter: "newsletter",
  pageViews: "analytics",
  coupons: "coupons",
  reviews: "reviews",
  faq: "faq",
  auditLogs: "auditLogs",
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // New setting form
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newGroup, setNewGroup] = useState("general");
  const [newIsPublic, setNewIsPublic] = useState(true);

  // Database management
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [clearing, setClearing] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [confirmInput, setConfirmInput] = useState("");

  useEffect(() => {
    adminGet<SiteSetting[]>("/settings/all")
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  async function handleSave(setting: SiteSetting) {
    setSaving(true);
    try {
      let parsed: unknown = editValue;
      try {
        parsed = JSON.parse(editValue);
      } catch {
        // keep as string
      }
      await adminPut("/settings", {
        key: setting.key,
        value: parsed,
        group: setting.group,
        isPublic: setting.isPublic,
      });
      setSettings((prev) =>
        prev.map((s) =>
          s.id === setting.id ? { ...s, value: parsed } : s,
        ),
      );
      setEditingId(null);
      toast("Setting updated", "success");
    } catch {
      toast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newKey) return;
    setSaving(true);
    try {
      let parsed: unknown = newValue;
      try { parsed = JSON.parse(newValue); } catch { /* keep as string */ }
      await adminPut("/settings", {
        key: newKey,
        value: parsed,
        group: newGroup,
        isPublic: newIsPublic,
      });
      // Refetch
      const updated = await adminGet<SiteSetting[]>("/settings/all");
      setSettings(updated);
      setNewKey("");
      setNewValue("");
      setNewGroup("general");
      setNewIsPublic(true);
      toast("Setting created", "success");
    } catch {
      toast("Failed to create", "error");
    } finally {
      setSaving(false);
    }
  }

  async function loadDbStats() {
    setLoadingStats(true);
    try {
      const stats = await adminGet<DbStats>("/settings/database/stats");
      setDbStats(stats);
    } catch {
      toast("Failed to load database stats", "error");
    } finally {
      setLoadingStats(false);
    }
  }

  async function handleClearTable(table: string) {
    setClearing(table);
    try {
      await adminDelete(`/settings/database/table/${table}`);
      toast(`${TABLE_LABELS[table] ?? table} cleared`, "success");
      loadDbStats();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to clear", "error");
    } finally {
      setClearing(null);
      setConfirmTarget(null);
      setConfirmInput("");
    }
  }

  async function handleClearAll() {
    setClearing("all");
    try {
      await adminDelete("/settings/database/all");
      toast("All data cleared", "success");
      loadDbStats();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to clear", "error");
    } finally {
      setClearing(null);
      setConfirmTarget(null);
      setConfirmInput("");
    }
  }

  if (loading) return <LoadingState />;

  // Group settings by their group field
  const grouped = settings.reduce<Record<string, SiteSetting[]>>((acc, s) => {
    (acc[s.group] ??= []).push(s);
    return acc;
  }, {});

  const confirmLabel = confirmTarget === "all"
    ? "DELETE EVERYTHING"
    : TABLE_LABELS[confirmTarget ?? ""] ?? confirmTarget;

  return (
    <div ref={containerRef}>
      <PageHeader
        title="Settings"
        description="Manage site configuration."
      />

      {/* Existing Settings */}
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} data-animate className="mb-6 glass rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {group}
          </h2>
          <div className="divide-y divide-glass-border">
            {items.map((setting) => (
              <div
                key={setting.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {setting.key}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        setting.isPublic
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {setting.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                </div>

                {editingId === setting.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="glass-subtle rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-500/30"
                    />
                    <button
                      onClick={() => handleSave(setting)}
                      disabled={saving}
                      className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <code className="max-w-[300px] truncate rounded-lg bg-muted/50 px-2 py-1 text-xs text-foreground">
                      {typeof setting.value === "string"
                        ? setting.value
                        : JSON.stringify(setting.value)}
                    </code>
                    <button
                      onClick={() => {
                        setEditingId(setting.id);
                        setEditValue(
                          typeof setting.value === "string"
                            ? setting.value
                            : JSON.stringify(setting.value),
                        );
                      }}
                      className="text-xs font-medium text-primary-600 hover:text-primary-500"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add New Setting */}
      <div data-animate className="glass rounded-2xl p-5">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Add Setting
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField
            label="Key"
            required
            value={newKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKey(e.target.value)}
            placeholder="site_name"
          />
          <FormField
            label="Value"
            required
            value={newValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewValue(e.target.value)}
            placeholder="My Site"
          />
          <FormField
            label="Group"
            value={newGroup}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGroup(e.target.value)}
            placeholder="general"
          />
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 pb-2.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={newIsPublic}
                onChange={(e) => setNewIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-glass-border text-primary-500 focus:ring-primary-500/30"
              />
              Public
            </label>
            <button
              type="submit"
              disabled={saving || !newKey}
              className="btn-glass-primary rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div data-animate className="mt-8 rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
            <p className="text-xs text-muted-foreground">Irreversible database operations. Users and settings are always preserved.</p>
          </div>
        </div>

        {!dbStats ? (
          <button
            onClick={loadDbStats}
            disabled={loadingStats}
            className="rounded-xl border border-destructive/20 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            {loadingStats ? "Loading..." : "Show Database Management"}
          </button>
        ) : (
          <div className="space-y-4">
            {/* Table Stats + Clear Buttons */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(STATS_TO_TABLE).map(([statKey, tableKey]) => {
                const count = dbStats[statKey as keyof DbStats] ?? 0;
                const label = TABLE_LABELS[tableKey] ?? tableKey;
                return (
                  <div
                    key={tableKey}
                    className="flex items-center justify-between rounded-xl bg-background/50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{count} records</p>
                    </div>
                    <button
                      onClick={() => { setConfirmTarget(tableKey); setConfirmInput(""); }}
                      disabled={count === 0 || clearing !== null}
                      className="rounded-lg border border-destructive/20 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-30"
                    >
                      Clear
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Clear All */}
            <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-destructive">Clear All Data</p>
                <p className="text-xs text-muted-foreground">Delete everything except users and settings</p>
              </div>
              <button
                onClick={() => { setConfirmTarget("all"); setConfirmInput(""); }}
                disabled={clearing !== null}
                className="rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
              >
                Clear Everything
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <Modal
        open={confirmTarget !== null}
        onClose={() => { setConfirmTarget(null); setConfirmInput(""); }}
        title={confirmTarget === "all" ? "Clear All Data" : `Clear ${confirmLabel}`}
        footer={
          <>
            <button
              onClick={() => { setConfirmTarget(null); setConfirmInput(""); }}
              className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => confirmTarget === "all" ? handleClearAll() : handleClearTable(confirmTarget!)}
              disabled={clearing !== null || confirmInput !== confirmLabel}
              className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            >
              {clearing ? "Clearing..." : "Confirm Delete"}
            </button>
          </>
        }
      >
        <p className="mb-3 text-sm text-muted-foreground">
          This action is <span className="font-semibold text-destructive">permanent and cannot be undone</span>.
          {confirmTarget === "all"
            ? " All data will be deleted except user accounts and site settings."
            : ` All ${(confirmLabel ?? "").toLowerCase()} records will be permanently deleted.`}
        </p>
        <p className="mb-2 text-sm text-muted-foreground">
          Type <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-foreground">{confirmLabel}</code> to confirm:
        </p>
        <input
          value={confirmInput}
          onChange={(e) => setConfirmInput(e.target.value)}
          placeholder={confirmLabel ?? ""}
          className="glass w-full rounded-xl border-0 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/30"
          autoFocus
        />
      </Modal>
    </div>
  );
}
