"use client";

import { useRef, useState } from "react";

interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onChange: (from: string, to: string) => void;
}

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "All time", days: 0 },
] as const;

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0]!;
}

export function DateRangePicker({ dateFrom, dateTo, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activePreset = PRESETS.find((p) => {
    if (p.days === 0) return !dateFrom && !dateTo;
    return dateFrom === daysAgo(p.days) && !dateTo;
  });

  const label = activePreset
    ? activePreset.label
    : dateFrom || dateTo
      ? `${dateFrom || "..."} – ${dateTo || "..."}`
      : "All time";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="glass flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-foreground hover:bg-white/10"
      >
        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="max-w-[140px] truncate">{label}</span>
        <svg className={`h-3 w-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-white/10 bg-card p-3 shadow-xl">
            <div className="space-y-1">
              {PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  onClick={() => {
                    if (preset.days === 0) {
                      onChange("", "");
                    } else {
                      onChange(daysAgo(preset.days), "");
                    }
                    setOpen(false);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activePreset?.days === preset.days
                      ? "bg-primary-500/20 text-primary-400"
                      : "text-foreground hover:bg-white/5"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Custom range</p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => onChange(e.target.value, dateTo)}
                  className="glass h-8 flex-1 rounded-lg border-0 px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => onChange(dateFrom, e.target.value)}
                  className="glass h-8 flex-1 rounded-lg border-0 px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
