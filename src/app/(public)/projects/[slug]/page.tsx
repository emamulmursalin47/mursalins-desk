import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug, getProjects } from "@/lib/api";
import type { Project } from "@/types/api";
import { ProjectDetailView } from "@/components/projects/project-detail-view";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: `${project.title} | Projects`,
    description:
      project.description || `View details about ${project.title}`,
    openGraph: {
      title: project.title,
      description: project.description || "",
      images: project.featuredImage ? [{ url: project.featuredImage }] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  /* Fetch related projects — same technologies, excluding current */
  let relatedProjects: Project[] = [];
  try {
    const all = await getProjects(1, 100);
    const currentTechs = new Set(project.technologies);
    relatedProjects = all.data
      .filter(
        (p) =>
          p.id !== project.id &&
          p.technologies.some((t) => currentTechs.has(t)),
      )
      .slice(0, 3);
  } catch {
    /* silently ignore — related projects are non-critical */
  }

  return (
    <ProjectDetailView project={project} relatedProjects={relatedProjects} />
  );
}
