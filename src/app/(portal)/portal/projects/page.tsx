import { getMyProjects } from "@/lib/api";
import { ProjectCard } from "@/components/portal/project-card";
import { EmptyState } from "@/components/portal/empty-state";

export default async function MyProjectsPage() {
  const result = await getMyProjects();

  const projects = result.data;
  const total = projects.length;
  const active = projects.filter(
    (p) => p.status === "IN_PROGRESS" || p.status === "REVIEW",
  ).length;
  const completed = projects.filter((p) => p.status === "COMPLETED").length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold tracking-tight text-foreground">
          My Projects
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Track progress across all your projects.
        </p>
      </div>

      {/* Summary Bar */}
      {total > 0 && (
        <div className="glass glass-shine rounded-2xl p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10">
                <svg
                  className="h-5 w-5 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {total}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground">
                  Total Projects
                </p>
              </div>
            </div>

            <div className="divider-glass hidden h-10 w-px sm:block" />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10">
                <svg
                  className="h-5 w-5 text-info"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {active}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground">
                  Active
                </p>
              </div>
            </div>

            <div className="divider-glass hidden h-10 w-px sm:block" />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <svg
                  className="h-5 w-5 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {completed}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground">
                  Completed
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {total === 0 ? (
        <EmptyState
          message="No projects yet"
          description="When a project is created for you, it will appear here with full milestone tracking."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
