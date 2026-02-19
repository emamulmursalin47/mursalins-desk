"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useChat } from "@/contexts/chat-context";

function formatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ChatHistory() {
  const {
    conversationHistory,
    loadConversation,
    deleteConversationHistory,
    setShowHistory,
  } = useChat();
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 12, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.4)" },
      );
    }
  });

  return (
    <div
      ref={panelRef}
      className="absolute inset-x-0 bottom-0 top-[52px] z-10 flex flex-col overflow-hidden bg-[oklch(0.98_0.003_265/0.97)] backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          Conversation History
        </h3>
        <button
          onClick={() => setShowHistory(false)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label="Close history"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {conversationHistory.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6">
            <p className="text-center text-sm text-muted-foreground">
              No past conversations yet.
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversationHistory.map((entry) => (
              <div
                key={entry.sessionId}
                className="group flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/10"
              >
                {/* Chat icon */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5 text-primary-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3c-4.31 0-8 3.033-8 7 0 2.024.978 3.825 2.499 5.085a3.478 3.478 0 0 1-.522 1.756.75.75 0 0 0 .584 1.143 5.976 5.976 0 0 0 3.243-1.053c.7.196 1.44.302 2.196.302 4.31 0 8-3.033 8-7s-3.69-7-8-7Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {/* Content — clickable */}
                <button
                  onClick={() => loadConversation(entry.sessionId)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm text-foreground">
                    {entry.preview}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(entry.date)}
                  </p>
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteConversationHistory(entry.sessionId)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label="Remove from history"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-2.5">
        <button
          onClick={() => setShowHistory(false)}
          className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to chat
        </button>
      </div>
    </div>
  );
}
