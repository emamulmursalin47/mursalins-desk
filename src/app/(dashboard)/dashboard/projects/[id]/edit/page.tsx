"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminGet } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectForm } from "@/components/dashboard/project-form";
import { LoadingState } from "@/components/dashboard/loading-state";
import type { AdminProject } from "@/types/admin";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<AdminProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGet<AdminProject>(`/projects/${id}`)
      .then(setProject)
      .catch(() => router.push("/dashboard/projects"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <LoadingState />;
  if (!project) return null;

  return (
    <div>
      <PageHeader title="Edit Project" description={`Editing: ${project.title}`} action={
        <button onClick={() => router.push("/dashboard/projects")} className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium">&larr; Back</button>
      } />
      <ProjectForm project={project} />
    </div>
  );
}
