import { getClientDashboard } from "@/lib/api";
import { StatCard } from "@/components/portal/stat-card";
import { ProjectCard } from "@/components/portal/project-card";

export default async function PortalOverviewPage() {
  const data = await getClientDashboard();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your projects and activity at a glance.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard label="Active Projects" value={data.projects.active} />
        <StatCard
          label="Completed Milestones"
          value={data.milestones.completed}
        />
        <StatCard label="Pending Orders" value={data.orders.pending} />
        <StatCard
          label="Upcoming Appointments"
          value={data.appointments.upcoming}
        />
      </div>

      {/* Recent Projects */}
      {data.recentProjects.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Recent Projects
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
