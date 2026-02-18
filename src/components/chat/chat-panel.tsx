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
      <div className="iridescent-border h-full w-full rounded-2xl">
        <div className="relative z-[1] flex h-full w-full flex-col overflow-hidden rounded-2xl glass-shine bg-[oklch(0.98_0.003_265/0.55)] border border-white/50 shadow-[0_8px_40px_-8px_oklch(0.50_0.01_260/0.15),inset_0_1px_0_0_oklch(1_0_0/0.4)] backdrop-blur-[48px] backdrop-saturate-[1.8]">
          <ChatHeader />
          <ChatMessages />
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
