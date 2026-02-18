export default function AppointmentsLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="skeleton mx-auto h-5 w-28 rounded-full" />
            <div className="skeleton mx-auto h-14 w-80 max-w-full rounded-2xl" />
            <div className="skeleton mx-auto h-5 w-72 max-w-full rounded-xl" />
          </div>
        </div>
      </section>

      {/* Booking form skeleton */}
      <section className="py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="glass glass-shine rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col gap-8 md:flex-row">
              {/* Calendar */}
              <div className="flex-1">
                <div className="skeleton mb-4 h-5 w-32 rounded" />
                <div className="skeleton h-72 w-full rounded-xl" />
              </div>

              {/* Time slots */}
              <div className="flex-1">
                <div className="skeleton mb-4 h-5 w-28 rounded" />
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton h-10 rounded-lg" />
                  ))}
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="skeleton mb-2 h-4 w-16 rounded" />
                    <div className="skeleton h-11 w-full rounded-xl" />
                  </div>
                  <div>
                    <div className="skeleton mb-2 h-4 w-16 rounded" />
                    <div className="skeleton h-11 w-full rounded-xl" />
                  </div>
                  <div className="skeleton h-11 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
