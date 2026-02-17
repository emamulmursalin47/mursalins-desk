"use client";

import type { SiteSetting } from "@/types/api";

const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  available: {
    label: "Available for Projects",
    dot: "bg-success",
    text: "text-success",
  },
  limited: {
    label: "Limited Availability",
    dot: "bg-warning",
    text: "text-warning",
  },
  booked: {
    label: "Fully Booked",
    dot: "bg-destructive",
    text: "text-destructive",
  },
};

interface AvailabilityBadgeProps {
  settings: SiteSetting[];
}

export function AvailabilityBadge({ settings }: AvailabilityBadgeProps) {
  const setting = settings.find((s) => s.key === "availability_status");
  const status = typeof setting?.value === "string" ? setting.value : "available";
  const config = statusConfig[status] ?? statusConfig["available"]!;

  return (
    <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
      <span className={`h-2 w-2 rounded-full pulse-glow ${config.dot}`} />
      <span className={config.text}>{config.label}</span>
    </span>
  );
}
