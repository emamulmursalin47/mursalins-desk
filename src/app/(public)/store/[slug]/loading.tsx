export default function ProductDetailLoading() {
  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Product image */}
          <div className="w-full lg:w-1/2">
            <div className="skeleton aspect-square rounded-3xl" />
          </div>

          {/* Product info sidebar */}
          <div className="flex-1 space-y-5">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-10 w-full rounded-xl" />
            <div className="skeleton h-10 w-3/5 rounded-xl" />
            <div className="skeleton h-8 w-28 rounded-lg" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />

            <div className="my-4 h-px bg-border/50" />

            {/* Features */}
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="skeleton h-3.5 w-3.5 shrink-0 rounded-full" />
                  <div className="skeleton h-3 w-48 rounded" />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <div className="skeleton h-12 w-40 rounded-xl" />
              <div className="skeleton h-12 w-40 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Reviews skeleton */}
        <div className="mt-16">
          <div className="skeleton mb-6 h-8 w-32 rounded-xl" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass glass-shine rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="skeleton h-10 w-10 rounded-full" />
                  <div className="space-y-1.5">
                    <div className="skeleton h-4 w-28 rounded" />
                    <div className="skeleton h-3 w-20 rounded" />
                  </div>
                </div>
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton mt-1.5 h-3 w-3/4 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Related products */}
        <div className="mt-16">
          <div className="skeleton mb-8 h-8 w-48 rounded-xl" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass glass-shine overflow-hidden rounded-2xl p-1">
                <div className="skeleton aspect-video rounded-xl" />
                <div className="space-y-3 p-5">
                  <div className="skeleton h-5 w-3/4 rounded-lg" />
                  <div className="skeleton h-6 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
