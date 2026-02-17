import type { Milestone } from "@/types/api";

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  if (milestones.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No milestones have been created yet.
      </p>
    );
  }

  return (
    <div className="relative">
      {milestones.map((m, i) => {
        const isLast = i === milestones.length - 1;
        const isCompleted = m.status === "COMPLETED";
        const isActive = m.status === "IN_PROGRESS";

        return (
          <div key={m.id} className="relative flex gap-5 pb-8 last:pb-0">
            {/* Vertical connector */}
            {!isLast && (
              <div
                className={`absolute left-2.5 top-7 h-[calc(100%-12px)] w-px ${
                  isCompleted
                    ? "bg-linear-to-b from-success to-border"
                    : "bg-border"
                }`}
              />
            )}

            {/* Dot indicator */}
            <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
              {isCompleted ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
              ) : isActive ? (
                <div className="relative flex h-5 w-5 items-center justify-center">
                  <span className="absolute h-5 w-5 rounded-full bg-primary-500/20 animate-ping" />
                  <span className="relative h-3 w-3 rounded-full bg-primary-500" />
                </div>
              ) : (
                <div className="h-3 w-3 rounded-full border-2 border-border bg-background" />
              )}
            </div>

            {/* Content */}
            <div
              className={`flex-1 rounded-xl px-4 py-3 transition-colors ${
                isActive
                  ? "glass-subtle"
                  : isCompleted
                    ? "bg-success/4"
                    : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-sm font-semibold ${
                    isCompleted
                      ? "text-success"
                      : isActive
                        ? "text-primary-600"
                        : "text-foreground"
                  }`}
                >
                  {m.title}
                </p>
                {isActive && (
                  <span className="text-[10px] font-semibold tracking-wider text-primary-500 uppercase">
                    Current
                  </span>
                )}
              </div>

              {m.description && (
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {m.description}
                </p>
              )}

              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                {m.dueDate && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                      />
                    </svg>
                    {new Date(m.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                {m.completedAt && (
                  <span className="flex items-center gap-1 text-success">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {new Date(m.completedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
