export default function ProjectsLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="skeleton mx-auto h-12 w-48 rounded-2xl" />
            <div className="skeleton mx-auto h-5 w-80 max-w-full rounded-xl" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Filter pills skeleton */}
        <div className="mb-10 flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>

        {/* Project cards grid */}
        <div className="grid grid-cols-1 gap-6 pb-24 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass glass-shine overflow-hidden rounded-2xl p-1">
              <div className="skeleton aspect-video rounded-xl" />
              <div className="space-y-3 p-5">
                <div className="skeleton h-5 w-3/4 rounded-lg" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
                <div className="flex gap-2 pt-2">
                  <div className="skeleton h-6 w-16 rounded-full" />
                  <div className="skeleton h-6 w-16 rounded-full" />
                  <div className="skeleton h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
