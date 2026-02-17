"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

interface BookingSuccessProps {
  date: string;
  time: string;
  timezone: string;
}

export function BookingSuccess({ date, time, timezone }: BookingSuccessProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(
      containerRef.current,
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)" },
    );
    tl.fromTo(
      containerRef.current.querySelector("[data-check]"),
      { scale: 0 },
      { scale: 1, duration: 0.4, ease: "back.out(2)" },
      "-=0.2",
    );
  });

  return (
    <div
      ref={containerRef}
      className="glass-card glass-shine mx-auto max-w-lg rounded-2xl p-8 text-center sm:p-12"
    >
      <div
        data-check
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10"
      >
        <svg
          className="h-10 w-10 text-success"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h3 className="text-2xl font-bold text-foreground">
        Appointment Booked!
      </h3>

      <div className="mx-auto mt-4 glass-subtle rounded-xl p-4 max-w-xs">
        <p className="text-sm font-medium text-foreground">{date}</p>
        <p className="text-sm text-muted-foreground">
          {time} ({timezone})
        </p>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        You&apos;ll receive a confirmation email with meeting details shortly.
      </p>

      <Link
        href="/"
        className="btn-glass-secondary mt-8 inline-flex rounded-xl px-6 py-2.5 text-sm font-medium text-foreground"
      >
        Back to Home
      </Link>
    </div>
  );
}
