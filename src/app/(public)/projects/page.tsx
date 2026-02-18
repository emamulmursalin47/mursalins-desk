import type { Metadata } from "next";
import { getProjects } from "@/lib/api";
import { ProjectsHero } from "@/components/projects/projects-hero";
import { ProjectsGrid } from "@/components/projects/projects-grid";

export const metadata: Metadata = {
  title: "Projects | Mursalin",
  description:
    "Browse my portfolio of completed projects and ongoing work — built with modern technology and thoughtful design.",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  const result = await getProjects(currentPage, 12).catch(() => null);

  return (
    <>
      <ProjectsHero />
      <ProjectsGrid
        projects={result?.data ?? []}
        meta={result?.meta ?? null}
      />
    </>
  );
}
