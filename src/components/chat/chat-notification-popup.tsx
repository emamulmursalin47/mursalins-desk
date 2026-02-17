"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

interface ChatNotificationPopupProps {
  message: string;
  sender: string;
  onDismiss: () => void;
  onClick: () => void;
}

export function ChatNotificationPopup({
  message,
  sender,
  onDismiss,
  onClick,
}: ChatNotificationPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Entrance animation
  useGSAP(() => {
    if (popupRef.current) {
      gsap.fromTo(
        popupRef.current,
        { opacity: 0, y: 10, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.6)" },
      );
    }
  });

  // Auto-dismiss after 5s
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (popupRef.current) {
        gsap.to(popupRef.current, {
          opacity: 0,
          y: 10,
          scale: 0.9,
          duration: 0.2,
          ease: "power2.in",
          onComplete: onDismiss,
        });
      }
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDismiss]);

  const truncated =
    message.length > 80 ? message.slice(0, 80) + "..." : message;

  return (
    <div
      ref={popupRef}
      onClick={onClick}
      className="fixed bottom-24 right-6 z-50 w-72 cursor-pointer max-sm:bottom-22 max-sm:right-4 max-sm:w-[calc(100vw-5rem)]"
    >
      <div className="rounded-2xl border border-white/15 bg-[oklch(0.16_0.01_260/0.98)] p-3.5 shadow-[0_8px_32px_-8px_oklch(0.05_0.01_260/0.7)] backdrop-blur-xl">
        {/* Header */}
        <div className="mb-1.5 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/25">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3 w-3 text-primary-400"
            >
              <path
                fillRule="evenodd"
                d="M10 3c-4.31 0-8 3.033-8 7 0 2.024.978 3.825 2.499 5.085a3.478 3.478 0 0 1-.522 1.756.75.75 0 0 0 .584 1.143 5.976 5.976 0 0 0 3.243-1.053c.7.196 1.44.302 2.196.302 4.31 0 8-3.033 8-7s-3.69-7-8-7Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-xs font-semibold text-white">
            {sender === "ADMIN" ? "Mursalin" : "AI Assistant"}
          </span>
          {/* Dismiss button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Dismiss"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-3 w-3"
            >
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        </div>

        {/* Message preview */}
        <p className="text-sm leading-relaxed text-white/80">
          {truncated}
        </p>

        {/* Tap hint */}
        <p className="mt-2 text-[10px] text-white/35">
          Tap to open chat
        </p>
      </div>
    </div>
  );
}
