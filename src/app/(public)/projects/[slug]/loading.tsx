export default function ProjectDetailLoading() {
  return (
    <div>
      {/* Hero image skeleton */}
      <div className="mx-auto max-w-5xl px-4 pt-28 sm:px-6 lg:px-8">
        <div className="skeleton aspect-video rounded-3xl" />
      </div>

      {/* Header skeleton */}
      <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="skeleton mb-3 h-10 w-full rounded-xl" />
        <div className="skeleton mb-2 h-10 w-3/5 rounded-xl" />
        <div className="skeleton mb-6 h-5 w-4/5 rounded-lg" />

        {/* Tech tags */}
        <div className="mb-6 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-7 w-20 rounded-full" />
          ))}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 border-b border-foreground/5 pb-6">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-8 w-28 rounded-lg" />
        </div>
      </div>

      {/* Body skeleton */}
      <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 lg:px-8 space-y-4 pb-16">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton mt-6 h-6 w-48 rounded-lg" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton mt-4 aspect-video w-full rounded-2xl" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
      </div>

      {/* Related projects */}
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="skeleton mb-8 h-8 w-48 rounded-xl" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass glass-shine overflow-hidden rounded-2xl p-1">
              <div className="skeleton aspect-video rounded-xl" />
              <div className="space-y-3 p-5">
                <div className="skeleton h-5 w-3/4 rounded-lg" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="flex gap-2 pt-2">
                  <div className="skeleton h-6 w-16 rounded-full" />
                  <div className="skeleton h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
