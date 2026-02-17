interface LoadingStateProps {
  rows?: number;
}

export function LoadingState({ rows = 5 }: LoadingStateProps) {
  return (
    <div className="space-y-4">
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-7 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="border-b border-glass-border px-5 py-3">
          <div className="flex gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-20 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex gap-8 border-b border-glass-border px-5 py-3.5 last:border-0"
          >
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className="h-4 w-24 animate-pulse rounded bg-muted"
                style={{ animationDelay: `${(i * 4 + j) * 50}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
