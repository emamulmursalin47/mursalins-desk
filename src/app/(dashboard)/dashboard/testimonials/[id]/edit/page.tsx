"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminGet } from "@/lib/admin-api";
import { PageHeader } from "@/components/dashboard/page-header";
import { TestimonialForm } from "@/components/dashboard/testimonial-form";
import { LoadingState } from "@/components/dashboard/loading-state";
import type { AdminTestimonial } from "@/types/admin";

export default function EditTestimonialPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [testimonial, setTestimonial] = useState<AdminTestimonial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGet<AdminTestimonial>(`/testimonials/${id}`)
      .then(setTestimonial)
      .catch(() => router.push("/dashboard/testimonials"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <LoadingState />;
  if (!testimonial) return null;

  return (
    <div>
      <PageHeader
        title="Edit Testimonial"
        description={`Editing testimonial from ${testimonial.name}.`}
        action={
          <button onClick={() => router.push("/dashboard/testimonials")} className="btn-glass-secondary rounded-xl px-4 py-2 text-sm font-medium">&larr; Back</button>
        }
      />
      <TestimonialForm testimonial={testimonial} />
    </div>
  );
}
