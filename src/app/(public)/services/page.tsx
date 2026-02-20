import type { Metadata } from "next";
import { getServices } from "@/lib/api";
import { groupServicesByCategory } from "@/lib/services";
import { constructMetadata } from "@/lib/metadata";
import { ServicesHero } from "@/components/services/services-hero";
import { ServicesGrid } from "@/components/services/services-grid";

export const metadata: Metadata = constructMetadata({
  title: "Web Development Services — Hire a Freelance Full-Stack Developer",
  description:
    "Professional web development services by a freelance full-stack developer from Bangladesh. Custom web apps, SaaS platforms, e-commerce solutions, UI/UX design, API development, and consulting. Affordable packages for startups and businesses.",
  path: "/services",
  keywords: [
    "web development services",
    "best web development service",
    "freelance web development",
    "hire web developer",
    "affordable web development service",
    "custom website development",
    "professional web development Bangladesh",
    "SaaS development service",
    "e-commerce development service",
  ],
});

export default async function ServicesPage() {
  const services = await getServices().catch(() => []);
  const categories = groupServicesByCategory(services);

  return (
    <>
      <ServicesHero />
      <ServicesGrid categories={categories} />
    </>
  );
}
