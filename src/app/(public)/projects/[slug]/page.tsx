import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug, getProjects } from "@/lib/api";
import type { Project } from "@/types/api";
import { ProjectDetailView } from "@/components/projects/project-detail-view";
import { ProjectJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const result = await getProjects(1, 100).catch(() => null);
  return (result?.data ?? []).map((p) => ({ slug: p.slug }));
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
      url: `${siteConfig.url}/projects/${slug}`,
      images: project.featuredImage ? [{ url: project.featuredImage }] : [],
    },
    alternates: {
      canonical: `${siteConfig.url}/projects/${slug}`,
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
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Projects", url: `${siteConfig.url}/projects` },
          { name: project.title, url: `${siteConfig.url}/projects/${project.slug}` },
        ]}
      />
      <ProjectJsonLd project={project} />
      <ProjectDetailView project={project} relatedProjects={relatedProjects} />
    </>
  );
}
