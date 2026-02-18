export default function ServicesLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="skeleton mx-auto h-5 w-20 rounded-full" />
            <div className="skeleton mx-auto h-14 w-96 max-w-full rounded-2xl" />
            <div className="skeleton mx-auto h-5 w-80 max-w-full rounded-xl" />
          </div>
        </div>
      </section>

      {/* Category grid skeleton */}
      <section className="py-4 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="skeleton mx-auto h-9 w-56 rounded-2xl" />
            <div className="skeleton mx-auto mt-3 h-5 w-40 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="glass glass-shine overflow-hidden rounded-2xl p-1"
              >
                <div className="space-y-4 p-6">
                  <div className="skeleton h-6 w-28 rounded-full" />
                  <div className="skeleton h-10 w-32 rounded-lg" />
                  <div className="skeleton h-4 w-48 rounded" />
                  <div className="skeleton h-8 w-32 rounded-lg" />
                  <div className="my-4 h-px bg-border/50" />
                  <div className="skeleton mt-4 h-5 w-28 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
