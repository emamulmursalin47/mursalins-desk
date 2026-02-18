export default function AboutLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-10 md:flex-row">
            <div className="skeleton aspect-square w-64 shrink-0 rounded-3xl" />
            <div className="flex-1 space-y-4">
              <div className="skeleton h-5 w-24 rounded-full" />
              <div className="skeleton h-12 w-80 max-w-full rounded-2xl" />
              <div className="skeleton h-5 w-full rounded-xl" />
              <div className="skeleton h-5 w-3/4 rounded-xl" />
              <div className="flex gap-2 pt-2">
                <div className="skeleton h-9 w-9 rounded-full" />
                <div className="skeleton h-9 w-9 rounded-full" />
                <div className="skeleton h-9 w-9 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story skeleton */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="skeleton h-8 w-48 rounded-xl" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
          <div className="skeleton mt-4 h-4 w-full rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-3/4 rounded" />
        </div>
      </section>

      {/* Values skeleton */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="skeleton mx-auto h-10 w-40 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass glass-shine rounded-2xl p-6">
                <div className="skeleton mb-4 h-10 w-10 rounded-xl" />
                <div className="skeleton mb-2 h-5 w-32 rounded-lg" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton mt-1.5 h-3 w-4/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline skeleton */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="skeleton mx-auto h-10 w-48 rounded-2xl" />
          </div>
          <div className="mx-auto max-w-3xl space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass glass-shine rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="skeleton h-12 w-12 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-48 rounded-lg" />
                    <div className="skeleton h-3 w-32 rounded" />
                    <div className="skeleton h-3 w-full rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
