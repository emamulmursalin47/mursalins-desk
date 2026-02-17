"use client";

import type { OrderStatusHistory } from "@/types/admin";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-accent-500",
  PROCESSING: "bg-info",
  COMPLETED: "bg-success",
  CANCELLED: "bg-destructive",
  REFUNDED: "bg-warning",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Order placed",
  PROCESSING: "Processing started",
  COMPLETED: "Order completed",
  CANCELLED: "Order cancelled",
  REFUNDED: "Refund issued",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface ActivityTimelineProps {
  history: OrderStatusHistory[];
  showAdmin?: boolean;
}

export function ActivityTimeline({ history, showAdmin = true }: ActivityTimelineProps) {
  if (!history.length) return null;

  return (
    <div className="space-y-0">
      {history.map((entry, i) => {
        const color = STATUS_COLORS[entry.toStatus] ?? "bg-muted-foreground";
        const label = STATUS_LABELS[entry.toStatus] ?? entry.toStatus;
        const isLast = i === history.length - 1;

        return (
          <div key={entry.id} className="relative flex gap-3 pb-4">
            {/* Line */}
            {!isLast && (
              <div className="absolute left-[7px] top-4 h-full w-px bg-white/10" />
            )}

            {/* Dot */}
            <div className={`mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-background ${color}`} />

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{label}</p>
              {entry.reason && (
                <p className="mt-0.5 text-xs text-muted-foreground">{entry.reason}</p>
              )}
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{timeAgo(entry.createdAt)}</span>
                {showAdmin && entry.changedBy && (
                  <>
                    <span>&middot;</span>
                    <span>
                      {entry.changedBy.firstName} {entry.changedBy.lastName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
