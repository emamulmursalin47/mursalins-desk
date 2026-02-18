export default function PrivacyLoading() {
  return (
    <div>
      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="skeleton mx-auto mb-3 h-12 w-64 rounded-2xl" />
          <div className="skeleton mx-auto mb-10 h-4 w-40 rounded" />
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton h-6 w-48 rounded-lg" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-5/6 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
