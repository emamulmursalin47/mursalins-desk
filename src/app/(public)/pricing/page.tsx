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
  title: "Pricing",
  description:
    "Transparent pricing for web development, mobile apps, API/backend, and more. Choose the package that fits your project.",
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
