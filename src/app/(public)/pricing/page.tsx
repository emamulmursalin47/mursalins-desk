import type { Metadata } from "next";
import { getServices } from "@/lib/api";
import { groupServicesByCategory } from "@/lib/services";
import { PricingHero } from "@/components/pricing/pricing-hero";
import { PricingCategories } from "@/components/pricing/pricing-categories";
import { PricingFAQ } from "@/components/pricing/pricing-faq";
import { BookCallSection } from "@/components/home/book-call-section";
import { FAQPageJsonLd } from "@/components/seo/json-ld";
import { pricingFaqs } from "@/lib/faq-data";

export const metadata: Metadata = {
  title: "Pricing — Affordable Web Development Service Packages",
  description:
    "Transparent and affordable pricing for freelance web development services. Custom web apps, SaaS, e-commerce, API/backend packages. Hire a professional full-stack developer from Bangladesh.",
};

export default async function PricingPage() {
  const services = await getServices().catch(() => []);
  const categories = groupServicesByCategory(services);

  return (
    <>
      <FAQPageJsonLd
        items={pricingFaqs.map((f) => ({ question: f.q, answer: f.a }))}
      />
      <PricingHero />
      <PricingCategories categories={categories} />
      <PricingFAQ />
      <BookCallSection />
    </>
  );
}
