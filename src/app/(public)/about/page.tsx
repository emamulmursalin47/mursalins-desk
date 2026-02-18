import type { Metadata } from "next";
import { getExperiences, getSkills } from "@/lib/api";
import { constructMetadata } from "@/lib/metadata";
import { AboutHero } from "@/components/about/about-hero";
import { AboutStory } from "@/components/about/about-story";
import { AboutValues } from "@/components/about/about-values";
import { ExperienceTimeline } from "@/components/home/experience-timeline";
import { SkillsSection } from "@/components/home/skills-section";
import { BookCallSection } from "@/components/home/book-call-section";
import { PersonJsonLd, ProfilePageJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = constructMetadata({
  title: "About Md. Emamul Mursalin",
  description:
    "Learn about Md. Emamul Mursalin — a software engineer from Bangladesh with expertise in Next.js, React, Node.js, and full-stack web development. View experience, skills, and values.",
  path: "/about",
});

export default async function AboutPage() {
  const [experiences, skills] = await Promise.all([
    getExperiences().catch(() => []),
    getSkills().catch(() => []),
  ]);

  return (
    <>
      <PersonJsonLd />
      <ProfilePageJsonLd />
      <AboutHero />
      <AboutStory />
      <AboutValues />
      {experiences.length > 0 && <ExperienceTimeline experiences={experiences} />}
      {skills.length > 0 && <SkillsSection skills={skills} />}
      <BookCallSection />
    </>
  );
}
