"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/contexts/chat-context";
import { ChatMessageBubble } from "./chat-message-bubble";
import { ChatTypingIndicator } from "./chat-typing-indicator";

export function ChatMessages() {
  const { messages, isTyping, typingSender } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto py-3">
      {messages.length === 0 && (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Connecting...
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <ChatMessageBubble key={msg.id} message={msg} />
      ))}

      {isTyping && <ChatTypingIndicator sender={typingSender} />}

      <div ref={bottomRef} />
    </div>
  );
}
