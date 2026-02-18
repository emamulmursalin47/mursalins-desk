"use client";

import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createFadeUp, createStaggerFadeUp } from "@/lib/gsap";
import type { Skill } from "@/types/api";
import { Container } from "@/components/layout/container";

gsap.registerPlugin(ScrollTrigger);

interface SkillsSectionProps {
  skills: Skill[];
}

function proficiencyLabel(p: number) {
  if (p >= 90) return "Expert";
  if (p >= 75) return "Advanced";
  if (p >= 60) return "Proficient";
  return "Familiar";
}

function barColor(p: number) {
  if (p >= 90) return "bg-primary-500";
  if (p >= 75) return "bg-primary-400";
  return "bg-primary-300";
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const headingRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (headingRef.current) {
      createFadeUp(headingRef.current, { y: 20, duration: 0.5 });
    }
    if (sectionRef.current) {
      createStaggerFadeUp(sectionRef.current, "[data-animate]", {
        y: 16,
        duration: 0.4,
        stagger: 0.06,
      });
    }
  });

  return (
    <section className="relative py-16">
      <div className="pointer-events-none absolute left-0 bottom-0 h-80 w-80 rounded-full bg-primary-100/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-64 w-64 rounded-full bg-accent-100/20 blur-3xl" />

      <Container>
        <div ref={headingRef} data-gsap className="relative mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tech Stack
          </h2>
          <p className="mt-3 text-muted-foreground">
            Technologies I work with daily
          </p>
        </div>

        <div ref={sectionRef} className="relative flex flex-col gap-10">
          {Object.entries(grouped).map(([category, categorySkills]) => (
            <div key={category}>
              <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </h3>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {categorySkills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  const barRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!cardRef.current || !barRef.current || !numberRef.current || hasAnimated)
      return;

    const trigger = ScrollTrigger.create({
      trigger: cardRef.current,
      start: "top 90%",
      once: true,
      onEnter: () => {
        setHasAnimated(true);

        // Animate progress bar width
        gsap.fromTo(
          barRef.current,
          { width: "0%" },
          {
            width: `${skill.proficiency}%`,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.1,
          },
        );

        // Animate number counter
        const obj = { val: 0 };
        gsap.to(obj, {
          val: skill.proficiency,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.1,
          onUpdate() {
            if (numberRef.current) {
              numberRef.current.textContent = `${Math.round(obj.val)}%`;
            }
          },
        });
      },
    });

    return () => trigger.kill();
  }, [skill.proficiency, hasAnimated]);

  return (
    <div className="group/lift" data-animate>
    <div
      ref={cardRef}
      className="glass-card glass-shine group flex flex-col gap-3 rounded-xl p-5 will-change-transform transition-[transform,box-shadow] duration-300 ease-out group-hover/lift:-translate-y-1 group-hover/lift:shadow-lg group-hover/lift:shadow-primary-500/10"
    >
      {/* Icon */}
      <div className="flex items-center gap-3">
        {skill.iconUrl ? (
          <img
            src={skill.iconUrl}
            alt={skill.name}
            className="h-10 w-10 object-contain grayscale transition-[filter] duration-300 group-hover:grayscale-0"
            loading="lazy"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-lg font-bold text-primary-600">
            {skill.name.charAt(0)}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {skill.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {proficiencyLabel(skill.proficiency)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/50">
          <div
            ref={barRef}
            className={`h-full rounded-full ${barColor(skill.proficiency)}`}
            style={{ width: 0 }}
          />
        </div>
        <span
          ref={numberRef}
          className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground"
        >
          0%
        </span>
      </div>
    </div>
    </div>
  );
}
