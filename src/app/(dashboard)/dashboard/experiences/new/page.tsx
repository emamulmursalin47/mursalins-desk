import { PageHeader } from "@/components/dashboard/page-header";
import { ExperienceForm } from "@/components/dashboard/experience-form";

export default function NewExperiencePage() {
  return (
    <>
      <PageHeader
        title="Add Experience"
        description="Add a new work experience to your career timeline."
      />
      <ExperienceForm />
    </>
  );
}
