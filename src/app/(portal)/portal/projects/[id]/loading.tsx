export default function ProjectDetailLoading() {
  return (
    <div className="space-y-8">
      {/* Header card skeleton */}
      <div className="glass glass-shine rounded-3xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-3">
            <div className="skeleton h-8 w-64" />
            <div className="skeleton h-4 w-96 max-w-full" />
          </div>
          <div className="skeleton h-7 w-24 rounded-full" />
        </div>

        {/* Progress skeleton */}
        <div className="flex items-center gap-6 mt-6">
          <div className="skeleton h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-full rounded-full" />
            <div className="skeleton h-3 w-32" />
          </div>
        </div>

        <div className="divider-glass my-6" />
        <div className="flex gap-8">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-4 w-32" />
          <div className="flex gap-2">
            <div className="skeleton h-6 w-16 rounded-lg" />
            <div className="skeleton h-6 w-16 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Timeline skeleton */}
      <div className="glass rounded-3xl p-8">
        <div className="skeleton h-6 w-28 mb-6" />
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="skeleton h-5 w-5 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-48" />
                <div className="skeleton h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
