"use client";

import { useEffect, useState, use } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ExperienceForm } from "@/components/dashboard/experience-form";
import { LoadingState } from "@/components/dashboard/loading-state";
import { adminGet } from "@/lib/admin-api";
import type { Experience } from "@/types/api";

export default function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGet<Experience>(`/experiences/${id}`)
      .then((res) => setExperience(res))
      .catch(() => setExperience(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState />;
  if (!experience) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Experience not found.
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Edit Experience"
        description={`Editing: ${experience.title} at ${experience.company}`}
      />
      <ExperienceForm experience={experience} />
    </>
  );
}
