export default function BlogPostLoading() {
  return (
    <div>
      {/* Cover image skeleton */}
      <div className="mx-auto max-w-5xl px-4 pt-28 sm:px-6 lg:px-8">
        <div className="skeleton aspect-[21/9] rounded-3xl" />
      </div>

      {/* Header skeleton */}
      <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mb-4 flex gap-2">
          <div className="skeleton h-6 w-24 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
        <div className="skeleton mb-3 h-10 w-full rounded-xl" />
        <div className="skeleton mb-2 h-10 w-3/5 rounded-xl" />
        <div className="skeleton mb-6 h-5 w-4/5 rounded-lg" />
        <div className="flex items-center gap-3 border-b border-foreground/5 pb-6">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <div className="skeleton h-4 w-28 rounded" />
            <div className="skeleton h-3 w-40 rounded" />
          </div>
        </div>
      </div>

      {/* Body + TOC skeleton */}
      <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:flex lg:gap-10 lg:px-8">
        <div className="min-w-0 flex-1 space-y-4 pb-24">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton mt-6 h-6 w-48 rounded-lg" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton mt-6 h-6 w-56 rounded-lg" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="skeleton mt-4 aspect-video w-full rounded-2xl" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-4/5 rounded" />
        </div>
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="glass glass-shine rounded-2xl p-5">
            <div className="skeleton mb-4 h-3 w-28 rounded" />
            <div className="space-y-2.5">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-4/5 rounded" />
              <div className="skeleton ml-4 h-3 w-3/4 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton ml-4 h-3 w-2/3 rounded" />
              <div className="skeleton h-3 w-5/6 rounded" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
