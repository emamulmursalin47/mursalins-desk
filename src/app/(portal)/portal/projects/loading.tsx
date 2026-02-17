export default function ProjectsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="skeleton h-8 w-44" />
        <div className="skeleton h-4 w-64" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass glass-shine rounded-2xl p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="skeleton h-5 w-36" />
              <div className="skeleton h-5 w-20 rounded-full" />
            </div>
            <div className="skeleton h-2 w-full rounded-full mb-2" />
            <div className="skeleton h-3 w-24" />
            <div className="mt-5 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="skeleton h-5 w-14 rounded-lg" />
                <div className="skeleton h-5 w-14 rounded-lg" />
              </div>
              <div className="skeleton h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
