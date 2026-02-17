"use client";

import type { ChatMessage } from "@/contexts/chat-context";

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
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
