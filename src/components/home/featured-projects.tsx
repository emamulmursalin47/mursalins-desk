"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createFadeUp, createStaggerFadeUp, createFadeIn } from "@/lib/gsap";
import type { Project } from "@/types/api";
import { Container } from "@/components/layout/container";
import { ProjectCard } from "@/components/projects/project-card";

interface FeaturedProjectsProps {
  projects: Project[];
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (headingRef.current) {
      createFadeUp(headingRef.current, { y: 20, duration: 0.5 });
    }
    if (gridRef.current) {
      createStaggerFadeUp(gridRef.current, "[data-animate]");
    }
    if (ctaRef.current) {
      createFadeIn(ctaRef.current, { delay: 0.4 });
    }
  });

  return (
    <section className="relative py-16">
      <Container>
      <div ref={headingRef} className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Featured Projects
        </h2>
        <p className="mt-3 text-muted-foreground">
          A selection of recent work I&apos;m proud of
        </p>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <div ref={ctaRef} className="mt-10 text-center">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 transition-colors hover:text-primary-600"
        >
          View all projects &rarr;
        </Link>
      </div>
      </Container>
    </section>
  );
}

