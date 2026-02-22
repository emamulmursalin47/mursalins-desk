"use client";

import Image from "next/image";
import Link from "next/link";
import type { Project, ProjectStatus } from "@/types/api";

const statusConfig: Record<ProjectStatus, { label: string; classes: string }> =
  {
    COMPLETED: {
      label: "Completed",
      classes:
        "bg-emerald-500 text-white border-emerald-600/30 shadow-sm",
    },
    IN_PROGRESS: {
      label: "In Progress",
      classes: "bg-amber-500 text-white border-amber-600/30 shadow-sm",
    },
    REVIEW: {
      label: "Under Review",
      classes: "bg-blue-500 text-white border-blue-600/30 shadow-sm",
    },
    PROPOSAL: {
      label: "Proposal",
      classes: "bg-foreground/70 text-white border-foreground/20 shadow-sm",
    },
    INQUIRY: {
      label: "Inquiry",
      classes: "bg-foreground/70 text-white border-foreground/20 shadow-sm",
    },
    CANCELLED: {
      label: "Cancelled",
      classes:
        "bg-destructive text-white border-destructive/30 shadow-sm",
    },
  };

/** Truncate long tech names for compact display */
function truncateTag(tag: string, max = 22): string {
  return tag.length > max ? tag.slice(0, max - 1) + "…" : tag;
}

export function ProjectCard({ project }: { project: Project }) {
  const status = statusConfig[project.status];
  // Show tagline if available (it's the crafted summary), otherwise description
  const summary = project.tagline || project.description;

  return (
    <div className="group/lift relative block rounded-2xl" data-animate>
      <article className="glass-card group flex h-full flex-col overflow-hidden rounded-2xl p-1 transition-[transform,box-shadow] duration-300 ease-out group-hover/lift:-translate-y-1 group-hover/lift:shadow-xl group-hover/lift:shadow-primary-500/10">
        {/* Thumbnail */}
        <div className="relative shrink-0 aspect-video overflow-hidden rounded-xl bg-muted">
          {project.featuredImage ? (
            <Image
              src={project.featuredImage}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-linear-to-br from-primary-50 to-accent-50">
              <div className="h-12 w-12 rounded-full bg-primary-200/60" />
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm ${status.classes}`}
            >
              {status.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col px-4 pt-3 pb-2">
          <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-1 sm:text-base">
            {project.title}
          </h3>

          {summary && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {summary}
            </p>
          )}

          {/* Tech tags */}
          {project.technologies.length > 0 && (
            <div className="mt-auto flex flex-wrap items-center gap-1 pt-3">
              {project.technologies.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="glass-subtle rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {truncateTag(tech)}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground/70">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action links — separated by border, always at bottom */}
        <div className="shrink-0 border-t border-foreground/5 px-4 py-2.5">
          <div className="flex items-center gap-3">
            {/* Stretched link: covers the entire card for navigation */}
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary-500 transition-colors group-hover:text-primary-600 after:absolute after:inset-0"
              aria-label={`View project: ${project.title}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              Details
            </Link>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Demo
              </a>
            )}
            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/></svg>
                Code
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
