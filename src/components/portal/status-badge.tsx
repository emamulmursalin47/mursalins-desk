const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  INQUIRY: {
    bg: "bg-info/8",
    text: "text-info",
    dot: "bg-info",
  },
  PROPOSAL: {
    bg: "bg-warning/8",
    text: "text-warning",
    dot: "bg-warning",
  },
  IN_PROGRESS: {
    bg: "bg-primary-50",
    text: "text-primary-600",
    dot: "bg-primary-500",
  },
  REVIEW: {
    bg: "bg-accent-50",
    text: "text-accent-600",
    dot: "bg-accent-500",
  },
  COMPLETED: {
    bg: "bg-success/8",
    text: "text-success",
    dot: "bg-success",
  },
  CANCELLED: {
    bg: "bg-destructive/8",
    text: "text-destructive",
    dot: "bg-destructive",
  },
  PENDING: {
    bg: "bg-warning/8",
    text: "text-warning",
    dot: "bg-warning",
  },
  PROCESSING: {
    bg: "bg-primary-50",
    text: "text-primary-600",
    dot: "bg-primary-500",
  },
  CONFIRMED: {
    bg: "bg-success/8",
    text: "text-success",
    dot: "bg-success",
  },
  REFUNDED: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  SUCCEEDED: {
    bg: "bg-success/8",
    text: "text-success",
    dot: "bg-success",
  },
  FAILED: {
    bg: "bg-destructive/8",
    text: "text-destructive",
    dot: "bg-destructive",
  },
};

const FALLBACK = {
  bg: "bg-muted",
  text: "text-muted-foreground",
  dot: "bg-muted-foreground",
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || FALLBACK;
  const label = status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
}
