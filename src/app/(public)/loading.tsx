export default function HomeLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="skeleton mx-auto h-5 w-32 rounded-full" />
            <div className="skeleton mx-auto h-14 w-96 max-w-full rounded-2xl" />
            <div className="skeleton mx-auto h-14 w-72 max-w-full rounded-2xl" />
            <div className="skeleton mx-auto h-5 w-80 max-w-full rounded-xl" />
            <div className="flex justify-center gap-3 pt-4">
              <div className="skeleton h-11 w-36 rounded-xl" />
              <div className="skeleton h-11 w-36 rounded-xl" />
            </div>
          </div>
          {/* Stats */}
          <div className="mx-auto mt-16 flex max-w-2xl justify-center gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="skeleton mx-auto h-10 w-16 rounded-lg" />
                <div className="skeleton mx-auto mt-2 h-3 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured projects skeleton */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="skeleton mx-auto h-10 w-64 rounded-2xl" />
            <div className="skeleton mx-auto mt-3 h-5 w-80 max-w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass glass-shine overflow-hidden rounded-2xl p-1">
                <div className="skeleton aspect-video rounded-xl" />
                <div className="space-y-3 p-5">
                  <div className="skeleton h-5 w-3/4 rounded-lg" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                  <div className="flex gap-2 pt-2">
                    <div className="skeleton h-6 w-16 rounded-full" />
                    <div className="skeleton h-6 w-16 rounded-full" />
                    <div className="skeleton h-6 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services skeleton */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="skeleton mx-auto h-10 w-56 rounded-2xl" />
            <div className="skeleton mx-auto mt-3 h-5 w-72 max-w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass glass-shine overflow-hidden rounded-2xl p-1">
                <div className="space-y-4 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="skeleton h-8 w-8 rounded-lg" />
                      <div className="skeleton h-5 w-40 rounded-lg" />
                    </div>
                    <div className="skeleton h-7 w-24 rounded-lg" />
                  </div>
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-48 rounded" />
                  <div className="my-5 h-px bg-border/50" />
                  <div className="skeleton h-10 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience timeline skeleton */}
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
