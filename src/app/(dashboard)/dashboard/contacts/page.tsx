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
import type { Contact } from "@/types/admin";
import type { PaginatedResult } from "@/types/api";

const TABS = ["All", "NEW", "READ", "REPLIED", "ARCHIVED"] as const;

const columns: Column<Contact>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  {
    key: "subject",
    label: "Subject",
    render: (r) => (
      <span className="max-w-[200px] truncate block">
        {r.subject || "—"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (r) => <StatusBadge status={r.status} />,
  },
  {
    key: "createdAt",
    label: "Date",
    sortable: true,
    render: (r) =>
      new Date(r.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
  },
];

export default function ContactsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResult<Contact> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<string>("All");
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminGet<PaginatedResult<Contact>>(
        `/contact?page=${page}&limit=20`,
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
        title="Contacts"
        description="Manage contact form submissions."
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
            onRowClick={(r) => router.push(`/dashboard/contacts/${r.id}`)}
            emptyMessage="No contacts found."
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
