export default function ProfileLoading() {
  return (
    <div className="animate-in fade-in space-y-6">
      {/* Page heading */}
      <div>
        <div className="skeleton h-7 w-36 rounded-lg" />
        <div className="skeleton mt-2 h-4 w-64 rounded-md" />
      </div>

      {/* Main profile card */}
      <div className="glass glass-shine rounded-2xl p-6">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4">
          <div className="skeleton h-16 w-16 rounded-full" />
          <div>
            <div className="skeleton h-5 w-40 rounded-md" />
            <div className="skeleton mt-2 h-4 w-52 rounded-md" />
          </div>
        </div>

        {/* Form fields */}
        <div className="mt-6 space-y-4">
          {/* First Name / Last Name row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="skeleton mb-1 h-4 w-20 rounded-md" />
              <div className="skeleton h-10 w-full rounded-xl" />
            </div>
            <div>
              <div className="skeleton mb-1 h-4 w-20 rounded-md" />
              <div className="skeleton h-10 w-full rounded-xl" />
            </div>
          </div>

          {/* Email */}
          <div>
            <div className="skeleton mb-1 h-4 w-12 rounded-md" />
            <div className="skeleton h-10 w-full rounded-xl" />
          </div>

          {/* Phone */}
          <div>
            <div className="skeleton mb-1 h-4 w-14 rounded-md" />
            <div className="skeleton h-10 w-full rounded-xl" />
          </div>

          {/* Bio */}
          <div>
            <div className="skeleton mb-1 h-4 w-8 rounded-md" />
            <div className="skeleton h-24 w-full rounded-xl" />
          </div>
        </div>

        {/* Edit button */}
        <div className="mt-6">
          <div className="skeleton h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Account Info card */}
      <div className="glass rounded-2xl p-6">
        <div className="skeleton h-4 w-40 rounded-md" />
        <div className="mt-3 space-y-2">
          <div className="skeleton h-4 w-36 rounded-md" />
          <div className="skeleton h-4 w-52 rounded-md" />
          <div className="skeleton h-4 w-60 rounded-md" />
        </div>
      </div>
    </div>
  );
}
