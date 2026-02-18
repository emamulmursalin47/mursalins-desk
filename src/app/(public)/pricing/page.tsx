import type { Metadata } from "next";
import { getServices } from "@/lib/api";
import { groupServicesByCategory } from "@/lib/services";
import { PricingHero } from "@/components/pricing/pricing-hero";
import { PricingCategories } from "@/components/pricing/pricing-categories";
import { PricingFAQ } from "@/components/pricing/pricing-faq";
import { BookCallSection } from "@/components/home/book-call-section";

export const metadata: Metadata = {
  title: "Pricing | Mursalin's Desk",
  description:
    "Transparent pricing for web development, mobile apps, API/backend, and more. Choose the package that fits your project.",
};

export default async function PricingPage() {
  const services = await getServices().catch(() => []);
  const categories = groupServicesByCategory(services);

  return (
    <>
      <PricingHero />
      <PricingCategories categories={categories} />
      <PricingFAQ />
      <BookCallSection />
    </>
  );
}
