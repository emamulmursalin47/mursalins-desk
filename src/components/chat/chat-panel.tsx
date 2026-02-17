"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";

export function ChatPanel() {
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.4)" },
      );
    }
  });

  return (
    <div
      ref={panelRef}
      className="fixed bottom-24 right-6 z-50 h-120 w-95 max-sm:bottom-20 max-sm:right-4 max-sm:w-[calc(100vw-2rem)]"
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl glass-heavy glass-shine">
        <ChatHeader />
        <ChatMessages />
        <ChatInput />
      </div>
    </div>
  );
}
