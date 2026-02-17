"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminGet } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { SkillForm } from "@/components/dashboard/skill-form";
import { LoadingState } from "@/components/dashboard/loading-state";
import type { Skill } from "@/types/api";

export default function EditSkillPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGet<Skill>(`/skills/${id}`)
      .then(setSkill)
      .catch(() => router.push("/dashboard/skills"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <LoadingState />;
  if (!skill) return null;

  return (
    <div>
      <PageHeader
        title="Edit Skill"
        description={`Editing ${skill.name}.`}
        action={
          <button
            onClick={() => router.push("/dashboard/skills")}
            className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium"
          >
            &larr; Back
          </button>
        }
      />
      <SkillForm skill={skill} />
    </div>
  );
}
