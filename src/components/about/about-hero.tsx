"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import {
  gsap,
  createStaggerFadeUp,
  GSAP_EASE,
} from "@/lib/gsap";
import Image from "next/image";
import { Container } from "@/components/layout/container";

const socialLinks = [
  { label: "GitHub", href: "https://github.com/emamulmursalin47" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/mdemamulmursalin/" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61584072675374" },
  { label: "WhatsApp", href: "https://wa.me/8801738753102" },
];

export function AboutHero() {
  const photoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (photoRef.current) {
      gsap.from(photoRef.current, {
        autoAlpha: 0,
        x: -40,
        scale: 0.95,
        duration: 1,
        ease: GSAP_EASE,
        delay: 0.2,
        immediateRender: true,
        onComplete() {
          photoRef.current?.removeAttribute("data-gsap");
          gsap.set(photoRef.current, { clearProps: "all" });
        },
      });
    }
    if (textRef.current) {
      createStaggerFadeUp(textRef.current, "[data-animate]", {
        scrollTrigger: false,
      });
    }
  });

  return (
    <section className="relative overflow-hidden pt-28 pb-16">
      {/* Ambient orbs */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 -left-32 h-100 w-100 rounded-full bg-primary-200/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-accent-200/20 blur-3xl" />
      </div>

      <Container>
        <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left — Photo */}
          <div ref={photoRef} data-gsap className="flex justify-center lg:justify-start">
            <div className="relative h-104 w-84 max-w-full sm:h-128 sm:w-100">
              <div className="glass-frame glass-shine relative h-full w-full overflow-hidden rounded-3xl px-2 pt-2">
                <Image
                  src="/hero.png"
                  alt="Md. Emamul Mursalin"
                  fill
                  priority
                  sizes="(max-width: 640px) 336px, 400px"
                  className="rounded-t-2xl object-cover object-top drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Right — Text */}
          <div ref={textRef} className="flex flex-col gap-5">
            <p
              className="text-xs font-medium uppercase tracking-widest text-primary-500"
              data-animate
            >
              About Me
            </p>

            <h1
              className="text-5xl font-bold tracking-tight text-foreground lg:text-6xl"
              data-animate
            >
              Md. Emamul Mursalin
            </h1>

            <p
              className="text-lg font-medium text-muted-foreground"
              data-animate
            >
              Software Engineer from Bangladesh
            </p>

            <p
              className="max-w-md text-base leading-relaxed text-muted-foreground"
              data-animate
            >
              I design and build modern web applications that solve real
              problems. From idea to deployment, I focus on clean architecture,
              performance, and experiences that users genuinely enjoy.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3" data-animate>
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card glass-shine rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
