export default function ContactLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="skeleton mx-auto h-5 w-28 rounded-full" />
            <div className="skeleton mx-auto h-14 w-80 max-w-full rounded-2xl" />
            <div className="skeleton mx-auto h-5 w-72 max-w-full rounded-xl" />
            <div className="skeleton mx-auto mt-4 h-8 w-44 rounded-full" />
          </div>
        </div>
      </section>

      {/* Client journey skeleton */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="skeleton mx-auto h-8 w-48 rounded-2xl" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass glass-shine w-48 shrink-0 rounded-2xl p-5">
                <div className="skeleton mb-3 h-8 w-8 rounded-full" />
                <div className="skeleton mb-2 h-4 w-24 rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton mt-1 h-3 w-3/4 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs + form skeleton */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Tab bar */}
          <div className="mb-8 flex justify-center gap-2">
            <div className="skeleton h-10 w-36 rounded-full" />
            <div className="skeleton h-10 w-36 rounded-full" />
          </div>
          {/* Form */}
          <div className="glass glass-shine rounded-2xl p-6 sm:p-8">
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <div className="skeleton mb-2 h-4 w-16 rounded" />
                  <div className="skeleton h-11 w-full rounded-xl" />
                </div>
                <div>
                  <div className="skeleton mb-2 h-4 w-16 rounded" />
                  <div className="skeleton h-11 w-full rounded-xl" />
                </div>
              </div>
              <div>
                <div className="skeleton mb-2 h-4 w-20 rounded" />
                <div className="skeleton h-11 w-full rounded-xl" />
              </div>
              <div>
                <div className="skeleton mb-2 h-4 w-20 rounded" />
                <div className="skeleton h-32 w-full rounded-xl" />
              </div>
              <div className="skeleton h-11 w-40 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
