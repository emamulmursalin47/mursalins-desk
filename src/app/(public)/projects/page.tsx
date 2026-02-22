import type { Metadata } from "next";
import { getProjects, getProjectIndustries } from "@/lib/api";
import { ProjectsHero } from "@/components/projects/projects-hero";
import { ProjectsGrid } from "@/components/projects/projects-grid";

export const metadata: Metadata = {
  title: "Projects — Web Development Portfolio",
  description:
    "Browse the portfolio of Md. Emamul Mursalin — freelance full-stack developer from Bangladesh. See completed web apps, SaaS platforms, and e-commerce projects built with React, Next.js & Node.js.",
};

interface PageProps {
  searchParams: Promise<{ page?: string; industry?: string }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const industry = params.industry || undefined;

  const [result, industries] = await Promise.all([
    getProjects(currentPage, 12, industry).catch(() => null),
    getProjectIndustries().catch(() => [] as string[]),
  ]);

  return (
    <>
      <ProjectsHero />
      <ProjectsGrid
        projects={result?.data ?? []}
        meta={result?.meta ?? null}
        industries={industries}
        activeIndustry={industry ?? null}
      />
    </>
  );
}
