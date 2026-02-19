"use client";

import { useChat } from "@/contexts/chat-context";

export function ChatHeader() {
  const { closeChat, requestHuman, resetChat, mode, isConnected, setShowHistory } = useChat();

  return (
    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-primary-500"
          >
            <path
              fillRule="evenodd"
              d="M10 3c-4.31 0-8 3.033-8 7 0 2.024.978 3.825 2.499 5.085a3.478 3.478 0 0 1-.522 1.756.75.75 0 0 0 .584 1.143 5.976 5.976 0 0 0 3.243-1.053c.7.196 1.44.302 2.196.302 4.31 0 8-3.033 8-7s-3.69-7-8-7Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {mode === "LIVE" ? "Live Chat" : "AI Assistant"}
          </h3>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isConnected
                  ? mode === "LIVE"
                    ? "bg-blue-400"
                    : "bg-emerald-400"
                  : "bg-muted-foreground"
              }`}
            />
            <span className="text-[11px] text-muted-foreground">
              {!isConnected
                ? "Connecting..."
                : mode === "LIVE"
                  ? "Connected to Mursalin"
                  : "Online"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {mode === "AI" && (
          <button
            onClick={requestHuman}
            className="flex items-center gap-1.5 rounded-lg bg-blue-500/15 px-2.5 py-1.5 text-[11px] font-medium text-blue-400 transition-colors hover:bg-blue-500/25"
            aria-label="Talk to Mursalin"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-3 w-3"
            >
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
            </svg>
            Talk to Mursalin
          </button>
        )}
        {/* History — always visible */}
        <button
          onClick={() => setShowHistory(true)}
          className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label="Conversation history"
        >
          History
        </button>
        {/* New Chat */}
        <button
          onClick={resetChat}
          className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label="New conversation"
        >
          New Chat
        </button>
        {/* Close panel */}
        <button
          onClick={closeChat}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label="Close chat"
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
    </div>
  );
}
