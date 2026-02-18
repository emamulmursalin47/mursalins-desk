export default function ServiceDetailLoading() {
  return (
    <div className="pt-24 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="flex gap-2">
            <div className="skeleton h-7 w-28 rounded-full" />
            <div className="skeleton h-7 w-36 rounded-full" />
          </div>
          <div className="skeleton h-12 w-3/4 rounded-2xl" />
          <div className="skeleton h-16 w-48 rounded-xl" />
          <div className="skeleton h-5 w-2/3 rounded-lg" />
          <div className="flex gap-4">
            <div className="skeleton h-8 w-32 rounded-lg" />
            <div className="skeleton h-8 w-48 rounded-lg" />
          </div>
        </div>

        {/* Description card */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="glass glass-shine rounded-2xl border-l-4 border-l-primary-500/20 p-8">
            <div className="space-y-2">
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
          </div>
        </div>

        {/* Deliverables */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="skeleton mb-6 h-6 w-36 rounded-lg" />
          <div className="glass glass-shine rounded-2xl p-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="skeleton h-4 w-4 shrink-0 rounded-full" />
                  <div className="skeleton h-3.5 w-full rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="glass glass-shine rounded-3xl p-8 text-center">
            <div className="skeleton mx-auto h-8 w-64 rounded-xl" />
            <div className="skeleton mx-auto mt-4 h-5 w-48 rounded-lg" />
            <div className="mt-6 flex justify-center gap-4">
              <div className="skeleton h-12 w-40 rounded-xl" />
              <div className="skeleton h-12 w-40 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Compare packages */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="skeleton mx-auto mb-8 h-8 w-48 rounded-xl" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="glass glass-shine overflow-hidden rounded-2xl p-1"
              >
                <div className="space-y-4 p-6">
                  <div className="skeleton h-6 w-28 rounded-full" />
                  <div className="skeleton h-10 w-32 rounded-lg" />
                  <div className="skeleton h-4 w-48 rounded" />
                  <div className="my-4 h-px bg-border/50" />
                  <div className="space-y-2.5">
                    {Array.from({ length: 4 }).map((_, j) => (
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
      </div>
    </div>
  );
}
