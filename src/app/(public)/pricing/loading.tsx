export default function PricingLoading() {
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

      {/* Category + tier cards skeleton */}
      <section className="py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="skeleton mx-auto h-9 w-56 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass glass-shine overflow-hidden rounded-2xl p-1">
                <div className="space-y-4 p-6">
                  <div className="skeleton h-6 w-28 rounded-full" />
                  <div className="skeleton h-10 w-32 rounded-lg" />
                  <div className="skeleton h-4 w-48 rounded" />
                  <div className="skeleton h-8 w-32 rounded-lg" />
                  <div className="my-4 h-px bg-border/50" />
                  <div className="skeleton h-3 w-28 rounded" />
                  <div className="space-y-2.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-2.5">
                        <div className="skeleton h-3.5 w-3.5 shrink-0 rounded-full" />
                        <div className="skeleton h-3 w-full rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="skeleton mt-4 h-11 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ skeleton */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="skeleton mx-auto mb-8 h-9 w-72 rounded-2xl" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass glass-shine rounded-xl px-5 py-4">
                <div className="skeleton h-4 w-3/4 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
