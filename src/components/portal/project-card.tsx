import Link from "next/link";
import type { ProjectWithMilestones } from "@/types/api";
import { StatusBadge } from "./status-badge";

interface ProjectCardProps {
  project: ProjectWithMilestones;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const total = project.milestones.length;
  const completed = project.milestones.filter(
    (m) => m.status === "COMPLETED",
  ).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Link href={`/portal/projects/${project.id}`} className="group block">
      <div className="glass-card glass-shine rounded-2xl p-6 transition-all duration-300 hover-hover:hover:-translate-y-1 hover-hover:hover:shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-foreground leading-snug hover-hover:group-hover:text-primary-600 transition-colors">
            {project.title}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        {project.description && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        )}

        {/* Progress bar */}
        {total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">
                {completed}/{total} milestones
              </span>
              <span className="text-[11px] font-semibold text-foreground">
                {percent}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-border/60">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-700 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          {project.technologies.length > 0 ? (
            <div className="flex gap-1.5 overflow-hidden">
              {project.technologies.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="glass-subtle rounded-lg px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="text-[10px] font-medium text-muted-foreground/60 self-center">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>
          ) : (
            <div />
          )}

          <span className="shrink-0 text-[11px] text-muted-foreground/70">
            {new Date(project.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
