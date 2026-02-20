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
  title: "About Md. Emamul Mursalin — Freelance Full-Stack Developer Bangladesh",
  description:
    "Meet Md. Emamul Mursalin — a freelance full-stack web developer from Bangladesh with expertise in React, Next.js, Node.js, and modern web technologies. Years of experience delivering web apps, SaaS platforms, and e-commerce solutions worldwide.",
  path: "/about",
  keywords: [
    "about Md. Emamul Mursalin",
    "freelance developer Bangladesh",
    "full stack developer Bangladesh",
    "web developer portfolio",
    "hire Bangladeshi developer",
    "remote freelance developer",
  ],
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
