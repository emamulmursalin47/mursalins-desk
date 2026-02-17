import { notFound } from "next/navigation";
import { getMyProject } from "@/lib/api";
import { StatusBadge } from "@/components/portal/status-badge";
import { MilestoneTimeline } from "@/components/portal/milestone-timeline";
import { ProgressRing } from "@/components/portal/progress-ring";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;

  let project;
  try {
    project = await getMyProject(id);
  } catch {
    notFound();
  }

  const total = project.milestones.length;
  const completed = project.milestones.filter(
    (m) => m.status === "COMPLETED",
  ).length;
  const inProgress = project.milestones.filter(
    (m) => m.status === "IN_PROGRESS",
  ).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground">
        <Link
          href="/portal/projects"
          className="shrink-0 transition-colors hover:text-foreground"
        >
          My Projects
        </Link>
        <svg
          className="h-3.5 w-3.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
        <span className="truncate font-medium text-foreground">{project.title}</span>
      </nav>

      {/* Hero Card */}
      <div className="glass glass-shine rounded-3xl p-5 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: Info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[28px] font-bold tracking-tight text-foreground">
                {project.title}
              </h1>
              <StatusBadge status={project.status} />
            </div>

            {project.description && (
              <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            )}

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-5 pt-1 text-[13px] text-muted-foreground">
              {project.startDate && (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="h-4 w-4 text-muted-foreground/60"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                  Started{" "}
                  {new Date(project.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              {project.endDate && (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="h-4 w-4 text-muted-foreground/60"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Due{" "}
                  {new Date(project.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            {/* Technologies */}
            {project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="glass-subtle rounded-lg px-3 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {/* Links */}
            {(project.liveUrl || project.repositoryUrl) && (
              <div className="flex gap-3 pt-2">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glass-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-foreground"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                    Live Site
                  </a>
                )}
                {project.repositoryUrl && (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline-glass inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-muted-foreground"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                      />
                    </svg>
                    Repository
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right: Progress Ring */}
          {total > 0 && (
            <div className="flex shrink-0 flex-col items-center gap-4 lg:pt-2">
              <ProgressRing percent={percent} size={96} />
              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {completed}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground">
                    Done
                  </p>
                </div>
                <div className="divider-glass w-px" />
                <div>
                  <p className="text-lg font-bold text-primary-600">
                    {inProgress}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground">
                    Active
                  </p>
                </div>
                <div className="divider-glass w-px" />
                <div>
                  <p className="text-lg font-bold text-foreground">{total}</p>
                  <p className="text-[10px] font-medium text-muted-foreground">
                    Total
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar (linear) */}
      {total > 0 && (
        <div className="glass-subtle rounded-2xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">
              Overall Progress
            </span>
            <span className="text-[13px] font-semibold text-foreground">
              {completed} of {total} milestones
            </span>
          </div>
          <div className="h-2 rounded-full bg-border/60">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Milestones Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Milestones
          </h2>
          {total > 0 && (
            <span className="text-[12px] font-medium text-muted-foreground">
              {completed}/{total} completed
            </span>
          )}
        </div>
        <div className="glass rounded-2xl p-4 sm:p-6">
          <MilestoneTimeline milestones={project.milestones} />
        </div>
      </div>

      {/* Images Gallery */}
      {project.images && project.images.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Gallery
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.images.map((img) => (
              <div
                key={img.id}
                className="glass glass-shine group overflow-hidden rounded-2xl"
              >
                <img
                  src={img.url}
                  alt={img.altText || project.title}
                  className="aspect-video w-full object-cover transition-transform duration-500 hover-hover:group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
