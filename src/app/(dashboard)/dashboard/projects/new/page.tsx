"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectForm } from "@/components/dashboard/project-form";

export default function NewProjectPage() {
  return (
    <div>
      <PageHeader title="New Project" description="Create a new portfolio project." />
      <ProjectForm />
    </div>
  );
}
