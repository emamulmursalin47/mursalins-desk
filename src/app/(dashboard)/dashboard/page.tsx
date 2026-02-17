"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { LoadingState } from "@/components/dashboard/loading-state";
import type { DashboardSummary } from "@/types/admin";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    adminGet<DashboardSummary>("/analytics/summary")
      .then(setData)
      .catch(() => setError(true))
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

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Welcome back. Here's an overview of your site." />
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-sm font-medium text-foreground">Failed to load dashboard data.</p>
          <p className="mt-1 text-xs text-muted-foreground">Please check your connection and try again.</p>
          <button
            onClick={() => { setError(false); setLoading(true); adminGet<DashboardSummary>("/analytics/summary").then(setData).catch(() => setError(true)).finally(() => setLoading(false)); }}
            className="btn-glass-primary mt-4 rounded-xl px-6 py-2.5 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's an overview of your site."
      />

      {/* Stats Row */}
      <div
        data-animate
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatsCard
          label="Unread Contacts"
          value={data?.unreadContacts ?? 0}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          }
        />
        <StatsCard
          label="Pending Appointments"
          value={data?.pendingAppointments ?? 0}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <StatsCard
          label="Total Orders"
          value={data?.totalOrders ?? 0}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          }
        />
        <StatsCard
          label="Today's Pageviews"
          value={data?.todayPageviews ?? 0}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div data-animate className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/dashboard/contacts", label: "View Contacts" },
          { href: "/dashboard/orders", label: "View Orders" },
          { href: "/dashboard/appointments", label: "Appointments" },
          { href: "/dashboard/blog/new", label: "New Blog Post" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="glass-subtle rounded-xl px-4 py-3 text-center text-sm font-medium text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-foreground hover:shadow-md"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Contacts */}
        <div data-animate className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Contacts
            </h2>
            <Link
              href="/dashboard/contacts"
              className="text-xs font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
          {data?.recentContacts && data.recentContacts.length > 0 ? (
            <div className="space-y-3">
              {data.recentContacts.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/contacts/${c.id}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2 transition-colors hover:bg-primary-50/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {c.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.email}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent contacts.</p>
          )}
        </div>

        {/* Recent Orders */}
        <div data-animate className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Orders
            </h2>
            <Link
              href="/dashboard/orders"
              className="text-xs font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
          {data?.recentOrders && data.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {data.recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/dashboard/orders/${o.id}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2 transition-colors hover:bg-primary-50/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      Order #{o.id.slice(-6)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {o.currency} {Number(o.totalAmount).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent orders.</p>
          )}
        </div>

        {/* Recent Appointments */}
        <div data-animate className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Appointments
            </h2>
            <Link
              href="/dashboard/appointments"
              className="text-xs font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
          {data?.recentAppointments && data.recentAppointments.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.recentAppointments.map((a) => (
                <Link
                  key={a.id}
                  href={`/dashboard/appointments/${a.id}`}
                  className="glass-subtle flex flex-col gap-1 rounded-xl p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {a.name}
                    </p>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  {a.topic && (
                    <p className="truncate text-xs text-muted-foreground">
                      {a.topic}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No recent appointments.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
