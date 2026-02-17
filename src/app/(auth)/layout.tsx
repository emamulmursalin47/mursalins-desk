"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { createFadeLeft } from "@/lib/gsap";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (panelRef.current) {
      createFadeLeft(panelRef.current, { scrollTrigger: false });
    }
  });

  return (
    <div className="flex min-h-dvh">
        {/* Left decorative panel — desktop only */}
        <div className="relative hidden overflow-hidden bg-linear-to-br from-primary-950 via-primary-900 to-primary-800 lg:flex lg:w-[45%] lg:flex-col lg:items-center lg:justify-center">
          {/* Ambient orbs */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary-400/15 blur-3xl liquid-float" />
            <div className="absolute bottom-1/4 -left-16 h-64 w-64 rounded-full bg-accent-400/10 blur-3xl liquid-float [animation-delay:2s]" />
            <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-primary-300/10 blur-3xl liquid-float [animation-delay:4s]" />
          </div>

          {/* Branding content */}
          <div ref={panelRef} className="relative z-10 max-w-sm px-8 text-center">
            {/* Logo / site name */}
            <Link href="/" className="group flex justify-center">
              <span className="font-display text-5xl font-bold tracking-tight text-white drop-shadow-lg transition-transform group-hover:scale-105">
                Mursalin
              </span>
            </Link>

            <h2 className="mt-8 text-3xl font-bold leading-tight text-white">
              Build. Ship.{" "}
              <span className="bg-linear-to-r from-primary-200 to-accent-300 bg-clip-text text-transparent">
                Grow.
              </span>
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Full-stack development for startups and businesses that need
              modern, scalable web applications.
            </p>

            {/* Decorative testimonial card */}
            <div className="mt-10 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-sm text-accent-300">
                    &#9733;
                  </span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-white/80 italic">
                &ldquo;Exceptional work on our platform. Clean code,
                fast delivery, and truly understood our vision.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                  A
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Happy Client
                  </p>
                  <p className="text-xs text-white/50">Startup Founder</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top specular shine overlay */}
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/5 via-transparent to-transparent"
            aria-hidden="true"
          />
        </div>

        {/* Right form panel */}
        <div className="relative flex w-full flex-1 items-center justify-center p-6 sm:p-8 lg:w-[55%]">
          {/* Subtle ambient orb */}
          <div
            className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-primary-100/30 blur-3xl liquid-float [animation-delay:1s]"
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-md">{children}</div>
        </div>
      </div>
  );
}
