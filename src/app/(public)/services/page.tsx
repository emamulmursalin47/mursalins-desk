import type { Metadata } from "next";
import { getServices } from "@/lib/api";
import { groupServicesByCategory } from "@/lib/services";
import { constructMetadata } from "@/lib/metadata";
import { ServicesHero } from "@/components/services/services-hero";
import { ServicesGrid } from "@/components/services/services-grid";

export const metadata: Metadata = constructMetadata({
  title: "Services",
  description:
    "Professional web development, e-commerce, UI/UX design, API & backend, and consulting services. View packages and pricing for every project scope.",
  path: "/services",
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
