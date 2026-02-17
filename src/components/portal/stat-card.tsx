interface StatCardProps {
  label: string;
  value: number | string;
  accent?: string;
}

export function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="glass-stat glass-shine rounded-2xl p-5 sm:p-6 transition-transform duration-300 hover-hover:hover:scale-[1.02]">
      <p className="text-[13px] font-medium tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-bold tracking-tight ${
          accent || "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
