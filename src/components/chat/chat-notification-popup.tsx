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
        { opacity: 0, y: 16, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.4)",
        },
      );
    }
  });

  // Auto-dismiss after 6s
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (popupRef.current) {
        gsap.to(popupRef.current, {
          opacity: 0,
          y: 10,
          scale: 0.95,
          duration: 0.25,
          ease: "power2.in",
          onComplete: onDismiss,
        });
      }
    }, 6000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDismiss]);

  const truncated =
    message.length > 100 ? message.slice(0, 100) + "..." : message;

  return (
    <div
      ref={popupRef}
      onClick={onClick}
      className="fixed bottom-24 right-6 z-50 w-76 cursor-pointer max-sm:bottom-22 max-sm:right-4 max-sm:w-[calc(100vw-5rem)]"
    >
      {/* Glass card with shine overlay */}
      <div className="glass-heavy glass-shine relative rounded-2xl p-4">
        {/* Accent glow behind the card */}
        <div className="absolute -inset-px -z-10 rounded-2xl bg-primary-500/10 blur-md" />

        {/* Header row */}
        <div className="mb-2 flex items-center gap-2.5">
          {/* Avatar */}
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/20 ring-1 ring-primary-500/30">
            {sender === "ADMIN" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3.5 w-3.5 text-primary-400"
              >
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5 text-primary-400"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3c-4.31 0-8 3.033-8 7 0 2.024.978 3.825 2.499 5.085a3.478 3.478 0 0 1-.522 1.756.75.75 0 0 0 .584 1.143 5.976 5.976 0 0 0 3.243-1.053c.7.196 1.44.302 2.196.302 4.31 0 8-3.033 8-7s-3.69-7-8-7Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {/* Sender name + online dot */}
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-foreground">
              {sender === "ADMIN" ? "Mursalin" : "AI Assistant"}
            </span>
          </div>

          {/* Dismiss X */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
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

        {/* Message */}
        <p className="text-[13px] leading-relaxed text-foreground/85">
          {truncated}
        </p>

        {/* Bottom row: hint + timestamp feel */}
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground/50 uppercase">
            Tap to reply
          </span>
          <span className="text-[10px] text-muted-foreground/40">
            just now
          </span>
        </div>
      </div>
    </div>
  );
}
