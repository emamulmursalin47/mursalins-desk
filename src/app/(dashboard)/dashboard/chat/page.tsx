"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, DURATION_ENTRY, STAGGER_DELAY, GSAP_EASE } from "@/lib/gsap";
import { adminGet, adminPatch } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { LoadingState } from "@/components/dashboard/loading-state";
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type {
  ChatConversation,
  ChatMessageRecord,
  ChatStatus,
} from "@/types/admin";
import type { PaginatedResult } from "@/types/api";

const TABS = ["All", "ACTIVE", "CLOSED", "ARCHIVED"] as const;

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function senderLabel(sender: string) {
  switch (sender) {
    case "VISITOR":
      return "Visitor";
    case "AI":
      return "AI";
    case "ADMIN":
      return "You";
    default:
      return sender;
  }
}

function senderColor(sender: string) {
  switch (sender) {
    case "VISITOR":
      return "text-foreground";
    case "AI":
      return "text-emerald-500";
    case "ADMIN":
      return "text-primary-500";
    default:
      return "text-muted-foreground";
  }
}

export default function ChatDashboardPage() {
  const [data, setData] = useState<PaginatedResult<ChatConversation> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<string>("All");
  const [selected, setSelected] = useState<ChatConversation | null>(null);
  const [loadingConvo, setLoadingConvo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam =
        tab !== "All" ? `&status=${tab as ChatStatus}` : "";
      const result = await adminGet<PaginatedResult<ChatConversation>>(
        `/chat/conversations?page=${page}&limit=20${statusParam}`,
      );
      setData(result);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [page, tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectConversation = useCallback(async (sessionId: string) => {
    setLoadingConvo(true);
    try {
      const convo = await adminGet<ChatConversation>(
        `/chat/conversations/${sessionId}`,
      );
      setSelected(convo);
    } catch {
      // silently handle
    } finally {
      setLoadingConvo(false);
    }
  }, []);

  const closeConversation = useCallback(
    async (sessionId: string) => {
      try {
        await adminPatch(`/chat/conversations/${sessionId}/close`, {});
        setSelected(null);
        fetchData();
      } catch {
        // silently handle
      }
    },
    [fetchData],
  );

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

  return (
    <div ref={containerRef}>
      <PageHeader
        title="Chat Conversations"
        description="View and manage visitor chat conversations."
      />

      {/* Filter Tabs */}
      <div data-animate className="mb-6 flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
              setSelected(null);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? "glass text-primary-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "All" ? "All" : t.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <div data-animate className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="space-y-2">
              {(data?.data ?? []).length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No conversations found.
                </p>
              )}
              {(data?.data ?? []).map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => selectConversation(convo.sessionId)}
                  className={`w-full rounded-xl p-3 text-left transition-colors ${
                    selected?.sessionId === convo.sessionId
                      ? "glass-card ring-2 ring-primary-500/30"
                      : "glass-subtle hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {convo.visitorName || "Anonymous"}
                        </span>
                        <StatusBadge status={convo.status} />
                      </div>
                      {convo.visitorEmail && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {convo.visitorEmail}
                        </p>
                      )}
                      {convo.messages?.[0] && (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {convo.messages[0].content.slice(0, 80)}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                          convo.mode === "LIVE"
                            ? "bg-blue-500/15 text-blue-500"
                            : "bg-emerald-500/15 text-emerald-500"
                        }`}
                      >
                        {convo.mode}
                      </span>
                      {convo.lastMessageAt && (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {formatTime(convo.lastMessageAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {data?.meta && data.meta.totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  page={data.meta.page}
                  totalPages={data.meta.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>

          {/* Conversation Detail */}
          <div className="lg:col-span-2">
            {!selected && !loadingConvo && (
              <div className="flex h-64 items-center justify-center rounded-2xl glass-subtle">
                <p className="text-sm text-muted-foreground">
                  Select a conversation to view messages.
                </p>
              </div>
            )}

            {loadingConvo && (
              <div className="flex h-64 items-center justify-center rounded-2xl glass-subtle">
                <LoadingState />
              </div>
            )}

            {selected && !loadingConvo && (
              <div className="rounded-2xl glass-card overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {selected.visitorName || "Anonymous"}{" "}
                      {selected.visitorEmail && (
                        <span className="font-normal text-muted-foreground">
                          ({selected.visitorEmail})
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Session: {selected.sessionId.slice(0, 12)}... | Mode:{" "}
                      <span
                        className={
                          selected.mode === "LIVE"
                            ? "text-blue-500"
                            : "text-emerald-500"
                        }
                      >
                        {selected.mode}
                      </span>
                    </p>
                  </div>
                  {selected.status === "ACTIVE" && (
                    <button
                      onClick={() => closeConversation(selected.sessionId)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      Close
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div className="max-h-[500px] space-y-3 overflow-y-auto p-4">
                  {(selected.messages ?? []).map(
                    (msg: ChatMessageRecord) => (
                      <div key={msg.id} className="flex gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold ${senderColor(msg.sender)}`}
                            >
                              {senderLabel(msg.sender)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          </div>
                          <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                  {(selected.messages ?? []).length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No messages in this conversation.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
