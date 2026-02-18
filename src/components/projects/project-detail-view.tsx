"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import {
  createFadeUp,
  createStaggerFadeUp,
  createFadeIn,
} from "@/lib/gsap";
import type {
  Project,
  ProjectWithMilestones,
  ProjectStatus,
  MilestoneStatus,
} from "@/types/api";
import { Container } from "@/components/layout/container";
import { ProjectCard } from "./project-card";

/* ─── Status config ─── */

const statusConfig: Record<ProjectStatus, { label: string; classes: string }> =
  {
    COMPLETED: {
      label: "Completed",
      classes: "bg-emerald-500 text-white border-emerald-600/30 shadow-sm",
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
      classes: "bg-destructive text-white border-destructive/30 shadow-sm",
    },
  };

const milestoneDot: Record<MilestoneStatus, string> = {
  COMPLETED: "bg-emerald-500",
  IN_PROGRESS: "bg-blue-500",
  PENDING: "bg-foreground/20",
};

const badgeLabels: Record<string, string> = {
  typescript: "TypeScript",
  tested: "Tested",
  accessible: "Accessible",
  responsive: "Responsive",
  secure: "Secure",
  "ci-cd": "CI/CD",
  docker: "Docker",
  seo: "SEO Optimized",
  performance: "High Performance",
};

/* ─── Component ─── */

interface ProjectDetailViewProps {
  project: ProjectWithMilestones;
  relatedProjects?: Project[];
}

export function ProjectDetailView({
  project,
  relatedProjects = [],
}: ProjectDetailViewProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const challengeRef = useRef<HTMLDivElement>(null);
  const approachRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);
  const challengesRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const status = statusConfig[project.status];
  const hasImages = project.images && project.images.length > 0;
  const hasMilestones = project.milestones && project.milestones.length > 0;
  const hasLinks = project.liveUrl || project.repositoryUrl;
  const hasMetrics = project.metrics && project.metrics.length > 0;
  const hasFeatures = project.features && project.features.length > 0;
  const hasChallenges = project.challenges && project.challenges.length > 0;
  const hasBadges = project.qualityBadges && project.qualityBadges.length > 0;
  const hasMetaRow =
    project.role ||
    project.clientName ||
    project.teamSize ||
    (project.startDate && project.endDate);

  const sortedMilestones = hasMilestones
    ? [...project.milestones].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
  const sortedImages = hasImages
    ? [...project.images!].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  useGSAP(() => {
    if (heroRef.current) {
      createFadeUp(heroRef.current, {
        y: 30,
        duration: 0.8,
        scrollTrigger: false,
      });
    }
    if (headerRef.current) {
      createStaggerFadeUp(headerRef.current, "[data-animate]", {
        scrollTrigger: false,
        delay: 0.3,
      });
    }
    if (metricsRef.current) {
      createStaggerFadeUp(metricsRef.current, "[data-animate]");
    }
    if (challengeRef.current) {
      createFadeUp(challengeRef.current);
    }
    if (approachRef.current) {
      createFadeUp(approachRef.current);
    }
    if (featuresRef.current) {
      createStaggerFadeUp(featuresRef.current, "[data-animate]");
    }
    if (techRef.current) {
      createStaggerFadeUp(techRef.current, "[data-animate]");
    }
    if (challengesRef.current) {
      createStaggerFadeUp(challengesRef.current, "[data-animate]");
    }
    if (galleryRef.current) {
      createStaggerFadeUp(galleryRef.current, "[data-animate]");
    }
    if (timelineRef.current) {
      createStaggerFadeUp(timelineRef.current, "[data-animate]");
    }
    if (badgesRef.current) {
      createFadeUp(badgesRef.current);
    }
    if (ctaRef.current) {
      createFadeUp(ctaRef.current);
    }
    if (relatedRef.current) {
      createStaggerFadeUp(relatedRef.current, "[data-animate]");
    }
    if (backRef.current) {
      createFadeIn(backRef.current, { delay: 0.2 });
    }
  });

  return (
    <>
      {/* ── 1. Hero Image ── */}
      {project.featuredImage && (
        <section className="relative overflow-hidden pt-20 pb-2 sm:pt-24 sm:pb-4">
          <Container>
            <div
              ref={heroRef}
              data-gsap
              className="relative overflow-hidden rounded-2xl bg-muted aspect-video sm:rounded-3xl sm:aspect-21/9"
            >
              <Image
                src={project.featuredImage}
                alt={project.title}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
              />
            </div>
          </Container>
        </section>
      )}

      {/* ── 2. Header ── */}
      <section className={project.featuredImage ? "py-8 sm:py-12" : "pt-24 pb-8 sm:pt-32 sm:pb-12"}>
        <Container>
          <div ref={headerRef} data-gsap className="space-y-3 sm:space-y-4">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2" data-animate>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium sm:px-3 sm:py-1 sm:text-sm ${status.classes}`}
              >
                {status.label}
              </span>
              {project.clientIndustry && (
                <span className="inline-flex items-center rounded-full border border-foreground/10 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:px-3 sm:py-1 sm:text-sm">
                  {project.clientIndustry}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
              data-animate
            >
              {project.title}
            </h1>

            {/* Tagline */}
            {project.tagline && (
              <p
                className="text-base font-medium text-primary-500 sm:text-lg lg:text-xl"
                data-animate
              >
                {project.tagline}
              </p>
            )}

            {/* Description */}
            {project.description && (
              <p
                className="text-sm leading-relaxed text-justify text-muted-foreground sm:text-base"
                data-animate
              >
                {project.description}
              </p>
            )}

            {/* Meta row */}
            {hasMetaRow && (
              <div
                className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground sm:gap-x-6 sm:gap-y-2 sm:text-sm"
                data-animate
              >
                {project.role && (
                  <div>
                    <span className="font-medium text-foreground">Role:</span>{" "}
                    {project.role}
                  </div>
                )}
                {project.clientName && (
                  <div>
                    <span className="font-medium text-foreground">
                      Client:
                    </span>{" "}
                    {project.clientName}
                  </div>
                )}
                {project.teamSize && (
                  <div>
                    <span className="font-medium text-foreground">Team:</span>{" "}
                    {project.teamSize}
                  </div>
                )}
                {project.startDate && (
                  <div>
                    <span className="font-medium text-foreground">
                      Started:
                    </span>{" "}
                    {new Date(project.startDate).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                )}
                {project.endDate && (
                  <div>
                    <span className="font-medium text-foreground">
                      Completed:
                    </span>{" "}
                    {new Date(project.endDate).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ── 3. Impact Metrics ── */}
      {hasMetrics && (
        <section className="py-8 sm:py-12">
          <Container>
            <div
              ref={metricsRef}
              className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
            >
              {project.metrics!.map((metric, i) => (
                <div
                  key={i}
                  className="glass-card glass-shine rounded-xl p-4 text-center sm:rounded-2xl sm:p-6"
                  data-animate
                >
                  <div className="text-2xl font-bold text-primary-500 sm:text-3xl">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-xs font-medium text-foreground sm:mt-2 sm:text-sm">
                    {metric.label}
                  </div>
                  {metric.description && (
                    <div className="mt-0.5 text-[11px] text-muted-foreground sm:mt-1 sm:text-xs">
                      {metric.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── 4. The Challenge ── */}
      {project.challenge && (
        <section className="py-8 sm:py-12">
          <Container>
            <div
              ref={challengeRef}
              data-gsap
              className="glass-card glass-shine rounded-xl border-l-4 border-l-amber-500 p-5 sm:rounded-2xl sm:p-8"
            >
              <h2 className="mb-3 text-lg font-bold text-foreground sm:mb-4 sm:text-xl">
                The Challenge
              </h2>
              <p className="text-sm leading-relaxed text-justify text-muted-foreground whitespace-pre-line sm:text-base">
                {project.challenge}
              </p>
            </div>
          </Container>
        </section>
      )}

      {/* ── 5. The Approach ── */}
      {project.approach && (
        <section className="py-8 sm:py-12">
          <Container>
            <div
              ref={approachRef}
              data-gsap
              className="glass-card glass-shine rounded-xl border-l-4 border-l-blue-500 p-5 sm:rounded-2xl sm:p-8"
            >
              <h2 className="mb-3 text-lg font-bold text-foreground sm:mb-4 sm:text-xl">
                The Approach
              </h2>
              <p className="text-sm leading-relaxed text-justify text-muted-foreground whitespace-pre-line sm:text-base">
                {project.approach}
              </p>
            </div>
          </Container>
        </section>
      )}

      {/* ── 6. Key Features ── */}
      {hasFeatures && (
        <section className="py-8 sm:py-12">
          <Container>
            <h2 className="mb-4 text-lg font-bold text-foreground sm:mb-6 sm:text-xl">
              Key Features
            </h2>
            <div
              ref={featuresRef}
              className="glass-card glass-shine rounded-xl p-5 sm:rounded-2xl sm:p-8"
            >
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                {project.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 sm:gap-3"
                    data-animate
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500 sm:h-5 sm:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-xs text-foreground sm:text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── 7. Scope ── */}
      {project.scope && (
        <section className="py-4 sm:py-6">
          <Container>
            <div className="glass-card glass-shine inline-flex items-center gap-2 rounded-full px-4 py-2 sm:px-5 sm:py-2.5">
              <span className="text-xs font-medium text-foreground sm:text-sm">
                Scope:
              </span>
              <span className="text-xs text-muted-foreground sm:text-sm">
                {project.scope}
              </span>
            </div>
          </Container>
        </section>
      )}

      {/* ── 8. Built With ── */}
      {project.technologies.length > 0 && (
        <section className="bg-muted/30 py-10 sm:py-14">
          <Container>
            <div ref={techRef}>
              <div className="mb-5 text-center sm:mb-8" data-animate>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-primary-500 sm:text-xs">
                  Tech Stack
                </span>
                <h2 className="mt-1 text-lg font-bold text-foreground sm:text-xl">
                  Built With
                </h2>
              </div>
              <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3" data-animate>
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="glass-card glass-shine rounded-xl px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary-500/10 sm:rounded-2xl sm:px-5 sm:py-2.5 sm:text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── 9. Challenges & Solutions ── */}
      {hasChallenges && (
        <section className="py-8 sm:py-12">
          <Container>
            <h2 className="mb-4 text-lg font-bold text-foreground sm:mb-6 sm:text-xl">
              Challenges &amp; Solutions
            </h2>
            <div ref={challengesRef} className="space-y-3 sm:space-y-4">
              {project.challenges!.map((item, i) => (
                <div
                  key={i}
                  className="glass-card glass-shine rounded-xl p-4 sm:rounded-2xl sm:p-6"
                  data-animate
                >
                  <div className="mb-2 sm:mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-500 sm:text-xs">
                      Challenge
                    </span>
                    <p className="mt-1 text-xs font-medium text-justify text-foreground sm:text-sm">
                      {item.challenge}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500 sm:text-xs">
                      Solution
                    </span>
                    <p className="mt-1 text-xs text-justify text-muted-foreground sm:text-sm">
                      {item.solution}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── 10. Gallery ── */}
      {hasImages && (
        <section className="bg-muted/30 py-10 sm:py-16">
          <Container>
            <h2 className="mb-5 text-lg font-bold text-foreground sm:mb-8 sm:text-xl">
              Gallery
            </h2>
            <div
              ref={galleryRef}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
            >
              {sortedImages.map((image) => (
                <div
                  key={image.id}
                  className="glass-card glass-shine group overflow-hidden rounded-xl p-1 sm:rounded-2xl"
                  data-animate
                >
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-muted sm:rounded-xl">
                    <Image
                      src={image.url}
                      alt={image.altText || "Project screenshot"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── 11. Timeline ── */}
      {hasMilestones && (
        <section className="py-10 sm:py-16">
          <Container>
            <h2 className="mb-5 text-lg font-bold text-foreground sm:mb-8 sm:text-xl">
              Project Timeline
            </h2>
            <div ref={timelineRef} className="relative space-y-3 sm:space-y-4">
              <div className="absolute top-3 bottom-3 left-[7px] w-0.5 bg-foreground/10" />

              {sortedMilestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="relative pl-7 sm:pl-8"
                  data-animate
                >
                  <div
                    className={`absolute top-2.5 left-0 h-3 w-3 rounded-full border-2 border-background sm:h-3.5 sm:w-3.5 ${milestoneDot[milestone.status]}`}
                  />

                  <div className="glass-card glass-shine rounded-xl p-4 sm:rounded-2xl sm:p-5">
                    <h3 className="text-sm font-semibold text-foreground sm:text-base">
                      {milestone.title}
                    </h3>
                    {milestone.description && (
                      <p className="mt-1.5 text-xs leading-relaxed text-justify text-muted-foreground sm:mt-2 sm:text-sm">
                        {milestone.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground sm:mt-3 sm:gap-4 sm:text-xs">
                      {milestone.dueDate && (
                        <span>
                          Due:{" "}
                          {new Date(milestone.dueDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      )}
                      {milestone.completedAt && (
                        <span className="text-emerald-600">
                          Completed:{" "}
                          {new Date(
                            milestone.completedAt,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── 12. Quality Badges ── */}
      {hasBadges && (
        <section className="py-6 sm:py-8">
          <Container>
            <div ref={badgesRef} data-gsap className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {project.qualityBadges.map((badge) => (
                <span
                  key={badge}
                  className="glass-subtle inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-muted-foreground sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-xs"
                >
                  <svg
                    className="h-3 w-3 text-emerald-500 sm:h-3.5 sm:w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  {badgeLabels[badge] || badge}
                </span>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── 13. Video ── */}
      {project.videoUrl && (
        <section className="py-8 sm:py-12">
          <Container>
            <h2 className="mb-4 text-lg font-bold text-foreground sm:mb-6 sm:text-xl">
              Project Video
            </h2>
            <div className="glass-card glass-shine overflow-hidden rounded-xl sm:rounded-2xl">
              <div className="aspect-video">
                <iframe
                  src={project.videoUrl}
                  title={`${project.title} video`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── 14. CTA Links ── */}
      {hasLinks && (
        <section className="py-10 sm:py-16">
          <Container>
            <div
              ref={ctaRef}
              data-gsap
              className="glass-card glass-shine rounded-2xl p-6 text-center sm:rounded-3xl sm:p-8"
            >
              <h2 className="mb-4 text-lg font-bold text-foreground sm:mb-6 sm:text-xl">
                Explore This Project
              </h2>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glass-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 sm:px-6 sm:py-3"
                  >
                    View Live Demo &rarr;
                  </a>
                )}
                {project.repositoryUrl && (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glass-secondary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 sm:px-6 sm:py-3"
                  >
                    View Source Code
                  </a>
                )}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── 15. Related Projects ── */}
      {relatedProjects.length > 0 && (
        <section className="bg-muted/30 py-10 sm:py-16">
          <Container>
            <h2 className="mb-6 text-center text-lg font-bold text-foreground sm:mb-8 sm:text-xl">
              Related Projects
            </h2>
            <div
              ref={relatedRef}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
            >
              {relatedProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── 16. Back link ── */}
      <section className="py-8 sm:py-12">
        <Container>
          <div ref={backRef} data-gsap className="text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 transition-colors hover:text-primary-600"
            >
              <span className="transition-transform hover:-translate-x-1">
                &larr;
              </span>
              Back to All Projects
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
