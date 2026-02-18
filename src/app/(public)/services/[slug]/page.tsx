import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServices } from "@/lib/api";
import { siteConfig } from "@/config/seo";
import {
  BreadcrumbJsonLd,
  ServiceJsonLd,
} from "@/components/seo/json-ld";
import { ServiceDetailView } from "@/components/services/service-detail-view";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const services = await getServices().catch(() => []);
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const services = await getServices().catch(() => []);
  const service = services.find((s) => s.slug === slug);

  if (!service) {
    return { title: "Service Not Found" };
  }

  const title = service.title;
  const description =
    service.description ??
    `${service.title} — ${service.tagline ?? "professional service package"}. Starting at $${Number(service.price).toLocaleString()}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/services/${service.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${siteConfig.url}/services/${service.slug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const allServices = await getServices().catch(() => []);
  const service = allServices.find((s) => s.slug === slug);

  if (!service) notFound();

  const relatedTiers = allServices.filter(
    (s) => s.category === service.category && s.id !== service.id,
  );

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Services", url: `${siteConfig.url}/services` },
          {
            name: service.title,
            url: `${siteConfig.url}/services/${service.slug}`,
          },
        ]}
      />
      <ServiceJsonLd service={service} />
      <ServiceDetailView service={service} relatedTiers={relatedTiers} />
    </>
  );
}
