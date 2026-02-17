"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { TestimonialForm } from "@/components/dashboard/testimonial-form";

export default function NewTestimonialPage() {
  return (
    <div>
      <PageHeader
        title="New Testimonial"
        description="Add a new client testimonial."
      />
      <TestimonialForm />
    </div>
  );
}
