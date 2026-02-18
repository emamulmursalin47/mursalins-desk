import { getExperiences, getSkills } from "@/lib/api";
import { AboutHero } from "@/components/about/about-hero";
import { AboutStory } from "@/components/about/about-story";
import { AboutValues } from "@/components/about/about-values";
import { ExperienceTimeline } from "@/components/home/experience-timeline";
import { SkillsSection } from "@/components/home/skills-section";
import { BookCallSection } from "@/components/home/book-call-section";

export default async function AboutPage() {
  const [experiences, skills] = await Promise.all([
    getExperiences().catch(() => []),
    getSkills().catch(() => []),
  ]);

  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutValues />
      {experiences.length > 0 && <ExperienceTimeline experiences={experiences} />}
      {skills.length > 0 && <SkillsSection skills={skills} />}
      <BookCallSection />
    </>
  );
}
