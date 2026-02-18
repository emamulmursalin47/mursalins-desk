import type { Metadata } from "next";
import {
  getProjects,
  getServices,
  getExperiences,
  getSkills,
  getProducts,
  getTestimonials,
  getFeaturedTestimonial,
  getTrustedCompanies,
  getPosts,
  getFAQs,
} from "@/lib/api";
import { groupServicesByCategory } from "@/lib/services";
import { siteConfig } from "@/config/seo";
import { HeroSection } from "@/components/home/hero-section";

import { FeaturedProjects } from "@/components/home/featured-projects";
import { ServicesSection } from "@/components/home/services-section";
import { ExperienceTimeline } from "@/components/home/experience-timeline";
import { SkillsSection } from "@/components/home/skills-section";
import { ProductsSpotlight } from "@/components/home/products-spotlight";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { BlogPreview } from "@/components/home/blog-preview";
import { BookCallSection } from "@/components/home/book-call-section";
import { NewsletterContact } from "@/components/home/newsletter-contact";
import { FAQSection } from "@/components/home/faq-section";

export const metadata: Metadata = {
  title: "Mursalin's Desk — Full-Stack Developer & SaaS Engineer",
  description:
    "Hire Md. Emamul Mursalin — a full-stack software engineer from Bangladesh building scalable web apps, SaaS platforms, and e-commerce solutions with Next.js, React & Node.js.",
  keywords: [
    ...siteConfig.keywords,
    "hire full-stack developer",
    "freelance web developer Bangladesh",
    "custom web application development",
  ],
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: "Mursalin's Desk — Full-Stack Developer & SaaS Engineer",
    description:
      "Hire Md. Emamul Mursalin — a full-stack software engineer building scalable web apps, SaaS platforms, and e-commerce solutions.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Mursalin's Desk — Full-Stack Developer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mursalin's Desk — Full-Stack Developer & SaaS Engineer",
    description:
      "Hire Md. Emamul Mursalin — a full-stack software engineer building scalable web apps, SaaS platforms, and e-commerce solutions.",
    images: [siteConfig.ogImage],
    creator: siteConfig.creator.twitter,
  },
};

export default async function Home() {
  const [
    projectsResult,
    services,
    experiences,
    skills,
    productsResult,
    testimonialsResult,
    featuredTestimonial,
    trustedCompanies,
    postsResult,
    faqs,
  ] = await Promise.all([
    getProjects(1, 3).catch(() => null),
    getServices().catch(() => []),
    getExperiences().catch(() => []),
    getSkills().catch(() => []),
    getProducts(1, 3).catch(() => null),
    getTestimonials(1, 6).catch(() => null),
    getFeaturedTestimonial().catch(() => null),
    getTrustedCompanies().catch(() => []),
    getPosts(1, 3).catch(() => null),
    getFAQs().catch(() => []),
  ]);

  const projects = projectsResult?.data ?? [];
  const products = productsResult?.data ?? [];
  const testimonials = testimonialsResult?.data ?? [];
  const posts = postsResult?.data ?? [];
  const serviceCategories = groupServicesByCategory(services);

  return (
    <>
      {/* 1. Hero */}
      <HeroSection
        trustedCompanies={trustedCompanies}
        featuredTestimonial={featuredTestimonial}
        testimonials={testimonials}
        totalProjects={projectsResult?.meta?.total ?? 0}
        totalClients={testimonialsResult?.meta?.total ?? 0}
        experiences={experiences}
      />

      {/* 2. Featured Projects */}
      {projects.length > 0 && <FeaturedProjects projects={projects} />}

      {/* 4. Service Packages */}
      {serviceCategories.length > 0 && (
        <ServicesSection categories={serviceCategories} />
      )}

      {/* 5. Experience Timeline */}
      {experiences.length > 0 && (
        <ExperienceTimeline experiences={experiences} />
      )}

      {/* 6. Tech Stack */}
      {skills.length > 0 && <SkillsSection skills={skills} />}

      {/* 7. Digital Products */}
      {products.length > 0 && <ProductsSpotlight products={products} />}

      {/* 8. Testimonials */}
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}

      {/* 9. Blog Preview */}
      {posts.length > 0 && <BlogPreview posts={posts} />}

      {/* 10. Book a Call CTA */}
      <BookCallSection />

      {/* 11. Newsletter + Contact */}
      <NewsletterContact />

      {/* 12. FAQ */}
      {faqs.length > 0 && <FAQSection faqs={faqs} />}
    </>
  );
}
