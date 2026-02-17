"use client";

import { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { LoadingState } from "@/components/dashboard/loading-state";
import type { AnalyticsDashboard } from "@/types/admin";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    adminGet<AnalyticsDashboard>("/analytics/dashboard")
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
        <PageHeader title="Analytics" description="Page view statistics and traffic insights." />
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-sm font-medium text-foreground">Failed to load analytics data.</p>
          <p className="mt-1 text-xs text-muted-foreground">Please check your connection and try again.</p>
          <button
            onClick={() => { setError(false); setLoading(true); adminGet<AnalyticsDashboard>("/analytics/dashboard").then(setData).catch(() => setError(true)).finally(() => setLoading(false)); }}
            className="btn-glass-primary mt-4 rounded-xl px-6 py-2.5 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...(data?.topPages?.map((p) => p.count) ?? [1]), 1);

  return (
    <div ref={containerRef}>
      <PageHeader
        title="Analytics"
        description="Page view statistics and traffic insights."
      />

      {/* Stats */}
      <div
        data-animate
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <StatsCard
          label="Total Pageviews"
          value={data?.totalPageviews ?? 0}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
        />
        <StatsCard
          label="Today's Pageviews"
          value={data?.todayPageviews ?? 0}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatsCard
          label="Top Pages Tracked"
          value={data?.topPages?.length ?? 0}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />
      </div>

      {/* Top Pages */}
      <div data-animate className="mt-8 glass rounded-2xl p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">
          Top Pages
        </h2>
        {data?.topPages && data.topPages.length > 0 ? (
          <div className="space-y-3">
            {data.topPages.map((page, i) => (
              <div key={page.path} className="flex items-center gap-4">
                <span className="w-6 text-right text-xs font-medium text-muted-foreground">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {page.path}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {page.count.toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-500"
                      style={{
                        width: `${(page.count / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No pageview data available yet.
          </p>
        )}
      </div>
    </div>
  );
}
