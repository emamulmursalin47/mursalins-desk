const STATUS_STYLES: Record<string, string> = {
  // Contact statuses
  NEW: "bg-info/10 text-info",
  READ: "bg-primary-100 text-primary-700",
  REPLIED: "bg-success/10 text-success",
  ARCHIVED: "bg-muted text-muted-foreground",

  // Appointment statuses
  PENDING: "bg-accent-100 text-accent-700",
  CONFIRMED: "bg-primary-100 text-primary-700",
  COMPLETED: "bg-success/10 text-success",
  CANCELLED: "bg-destructive/10 text-destructive",

  // Order statuses
  PROCESSING: "bg-info/10 text-info",
  REFUNDED: "bg-warning/10 text-warning",

  // Payment statuses
  SUCCEEDED: "bg-success/10 text-success",
  FAILED: "bg-destructive/10 text-destructive",

  // Post statuses
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-success/10 text-success",
  SCHEDULED: "bg-info/10 text-info",

  // Testimonial statuses
  APPROVED: "bg-success/10 text-success",
  REJECTED: "bg-destructive/10 text-destructive",

  // Project statuses
  INQUIRY: "bg-info/10 text-info",
  PROPOSAL: "bg-accent-100 text-accent-700",
  IN_PROGRESS: "bg-primary-100 text-primary-700",
  REVIEW: "bg-warning/10 text-warning",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? "bg-muted text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style} ${className}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
