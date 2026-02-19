"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Pagination } from "@/components/dashboard/pagination";
import { LoadingState } from "@/components/dashboard/loading-state";
import type { NewsletterSubscriber } from "@/types/admin";
import type { PaginatedResult } from "@/types/api";

const columns: Column<NewsletterSubscriber>[] = [
  { key: "email", label: "Email", sortable: true },
  {
    key: "name",
    label: "Name",
    render: (r) => r.name || "—",
  },
  {
    key: "isActive",
    label: "Status",
    render: (r) => (
      <StatusBadge status={r.isActive ? "ACTIVE" : "UNSUBSCRIBED"} />
    ),
  },
  {
    key: "createdAt",
    label: "Subscribed",
    sortable: true,
    render: (r) =>
      new Date(r.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
  },
];

export default function NewsletterPage() {
  const [data, setData] = useState<PaginatedResult<NewsletterSubscriber> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminGet<PaginatedResult<NewsletterSubscriber>>(
        `/newsletter/subscribers?page=${page}&limit=20`,
      );
      setData(result);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  return (
    <div ref={containerRef}>
      <PageHeader
        title="Newsletter"
        description="Manage newsletter subscribers."
      />

      {loading ? (
        <LoadingState />
      ) : (
        <div data-animate>
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            keyExtractor={(r) => r.id}
            emptyMessage="No subscribers yet."
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
    </div>
  );
}
