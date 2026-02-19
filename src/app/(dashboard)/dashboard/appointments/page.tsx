"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Pagination } from "@/components/dashboard/pagination";
import { LoadingState } from "@/components/dashboard/loading-state";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import type { AdminAppointment } from "@/types/admin";
import type { PaginatedResult } from "@/types/api";

const TABS = ["All", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

const columns: Column<AdminAppointment>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email" },
  {
    key: "date",
    label: "Date & Time",
    sortable: true,
    render: (r) =>
      new Date(r.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
  },
  {
    key: "topic",
    label: "Topic",
    render: (r) => (
      <span className="max-w-[180px] truncate block">{r.topic || "—"}</span>
    ),
  },
  {
    key: "duration",
    label: "Duration",
    render: (r) => `${r.duration} min`,
  },
  {
    key: "status",
    label: "Status",
    render: (r) => <StatusBadge status={r.status} />,
  },
];

export default function AppointmentsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResult<AdminAppointment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<string>("All");
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminGet<PaginatedResult<AdminAppointment>>(
        `/appointments?page=${page}&limit=20`,
      );
      setData(result);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [page]);

  const filtered = useMemo(() => {
    const items = data?.data ?? [];
    if (tab === "All") return items;
    return items.filter((r) => r.status === tab);
  }, [data, tab]);

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
        title="Appointments"
        description="Manage booked appointments."
      />

      <FilterTabs tabs={TABS} active={tab} onChange={(t) => { setTab(t); setPage(1); }} />

      {loading ? (
        <LoadingState />
      ) : (
        <div data-animate>
          <DataTable
            columns={columns}
            data={filtered}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => router.push(`/dashboard/appointments/${r.id}`)}
            emptyMessage="No appointments found."
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
