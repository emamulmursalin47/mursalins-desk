export default function PortalLoading() {
  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-72" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-stat rounded-2xl p-6">
            <div className="skeleton h-3 w-20 mb-3" />
            <div className="skeleton h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass glass-shine rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="skeleton h-5 w-36" />
              <div className="skeleton h-5 w-20 rounded-full" />
            </div>
            <div className="skeleton h-2 w-full rounded-full mb-2" />
            <div className="skeleton h-3 w-24" />
            <div className="mt-5 flex gap-2">
              <div className="skeleton h-5 w-14 rounded-lg" />
              <div className="skeleton h-5 w-14 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
