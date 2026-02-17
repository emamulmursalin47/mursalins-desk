"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { SkillForm } from "@/components/dashboard/skill-form";

export default function NewSkillPage() {
  return (
    <div>
      <PageHeader
        title="New Skill"
        description="Add a new skill to your tech stack."
      />
      <SkillForm />
    </div>
  );
}
