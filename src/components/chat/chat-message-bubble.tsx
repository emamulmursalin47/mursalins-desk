"use client";

import { type ReactNode } from "react";
import type { ChatMessage } from "@/contexts/chat-context";

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Lightweight inline markdown parser for chat messages.
 * Handles: **bold**, *italic*, `code`, and newlines.
 */
function formatContent(text: string): ReactNode[] {
  // Split into lines first to handle line breaks
  const lines = text.split("\n");
  const result: ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) result.push(<br key={`br-${lineIdx}`} />);

    // Tokenize inline formatting: **bold**, *italic*, `code`
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let tokenIdx = 0;

    while ((match = regex.exec(line)) !== null) {
      // Push text before this match
      if (match.index > lastIndex) {
        result.push(line.slice(lastIndex, match.index));
      }

      if (match[2]) {
        // **bold**
        result.push(
          <strong key={`b-${lineIdx}-${tokenIdx}`} className="font-semibold">
            {match[2]}
          </strong>,
        );
      } else if (match[3]) {
        // *italic*
        result.push(
          <em key={`i-${lineIdx}-${tokenIdx}`}>{match[3]}</em>,
        );
      } else if (match[4]) {
        // `code`
        result.push(
          <code
            key={`c-${lineIdx}-${tokenIdx}`}
            className="rounded bg-white/10 px-1 py-0.5 text-[13px]"
          >
            {match[4]}
          </code>,
        );
      }

      lastIndex = match.index + match[0].length;
      tokenIdx++;
    }

    // Push remaining text after last match
    if (lastIndex < line.length) {
      result.push(line.slice(lastIndex));
    }
  });

  return result;
}

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isVisitor = message.sender === "VISITOR";
  const isAdmin = message.sender === "ADMIN";

  return (
    <div
      className={`flex ${isVisitor ? "justify-end" : "justify-start"} px-4`}
    >
      <div
        className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${
          isVisitor
            ? "bg-primary-500/15 text-foreground rounded-2xl rounded-br-sm"
            : isAdmin
              ? "glass-card text-foreground rounded-2xl rounded-bl-sm"
              : "glass-subtle text-foreground rounded-2xl rounded-bl-sm"
        }`}
      >
        {isAdmin && (
          <span className="mb-1 block text-[10px] font-semibold text-primary-500">
            Mursalin
          </span>
        )}
        <div className="wrap-break-word">{formatContent(message.content)}</div>
        <span
          className={`mt-1 block text-[10px] ${
            isVisitor ? "text-right text-muted-foreground/70" : "text-muted-foreground/70"
          }`}
        >
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
