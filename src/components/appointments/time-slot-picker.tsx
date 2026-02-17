"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createStaggerFadeUp } from "@/lib/gsap";

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

interface TimeSlotPickerProps {
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export function TimeSlotPicker({
  selectedTime,
  onSelect,
}: TimeSlotPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    createStaggerFadeUp(containerRef.current, "[data-slot]");
  });

  function formatTime(time: string) {
    const h = time.split(":")[0] ?? "0";
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const display = hour > 12 ? hour - 12 : hour;
    return `${display}:00 ${suffix}`;
  }

  return (
    <div ref={containerRef}>
      <h4 className="mb-3 text-sm font-medium text-foreground">
        Select a Time
      </h4>
      <div className="flex flex-wrap gap-2">
        {TIME_SLOTS.map((time) => (
          <button
            key={time}
            data-slot
            onClick={() => onSelect(time)}
            className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
              selectedTime === time
                ? "glass-heavy ring-2 ring-primary-500 text-primary-600"
                : "glass-subtle text-muted-foreground hover:text-foreground"
            }`}
          >
            {formatTime(time)}
          </button>
        ))}
      </div>
    </div>
  );
}
