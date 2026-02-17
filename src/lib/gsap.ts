"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins once at module level (SSR-safe)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Animation constants ─────────────────────────────────────────
export const GSAP_EASE = "power1.out"; // ≈ cubic-bezier(0.25, 0.46, 0.45, 0.94)
export const DURATION_ENTRY = 0.6;
export const DURATION_SCALE = 0.5;
export const STAGGER_DELAY = 0.12;
export const OFFSET_Y = 24;
export const OFFSET_X = 24;

// Spring-equivalent easing (stiffness:260-400, damping:25-35)
export const SPRING_EASE = "back.out(1.4)";
export const SPRING_DURATION = 0.5;

// ─── Reusable animation functions ────────────────────────────────

interface AnimOptions {
  y?: number;
  duration?: number;
  stagger?: number;
  ease?: string;
  scrollTrigger?: boolean;
  delay?: number;
}

/**
 * Stagger fadeUp children of a container.
 * Replaces: variants={stagger} + variants={fadeUp} with whileInView
 */
export function createStaggerFadeUp(
  container: Element,
  childSelector: string,
  options?: AnimOptions,
) {
  const {
    y = OFFSET_Y,
    duration = DURATION_ENTRY,
    stagger = STAGGER_DELAY,
    ease = GSAP_EASE,
    scrollTrigger = true,
    delay = 0.1,
  } = options ?? {};

  const children = container.querySelectorAll(childSelector);
  if (children.length === 0) return;

  return gsap.from(children, {
    opacity: 0,
    y,
    duration,
    stagger,
    ease,
    delay,
    immediateRender: true,
    onComplete() {
      gsap.set(children, { clearProps: "transform,opacity" });
    },
    ...(scrollTrigger
      ? {
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            once: true,
          },
        }
      : {}),
  });
}

/**
 * Single element fadeUp.
 * Replaces: initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
 */
export function createFadeUp(
  element: Element,
  options?: AnimOptions,
) {
  const {
    y = OFFSET_Y,
    duration = DURATION_ENTRY,
    ease = GSAP_EASE,
    delay = 0,
    scrollTrigger = true,
  } = options ?? {};

  return gsap.from(element, {
    opacity: 0,
    y,
    duration,
    ease,
    delay,
    immediateRender: true,
    onComplete() {
      gsap.set(element, { clearProps: "transform,opacity" });
    },
    ...(scrollTrigger
      ? {
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            once: true,
          },
        }
      : {}),
  });
}

/**
 * FadeLeft (from x: -24).
 * Replaces: variants={fadeLeft}
 */
export function createFadeLeft(
  element: Element,
  options?: { duration?: number; ease?: string; scrollTrigger?: boolean },
) {
  const {
    duration = DURATION_ENTRY,
    ease = GSAP_EASE,
    scrollTrigger = true,
  } = options ?? {};

  return gsap.from(element, {
    opacity: 0,
    x: -OFFSET_X,
    duration,
    ease,
    immediateRender: true,
    onComplete() {
      gsap.set(element, { clearProps: "transform,opacity" });
    },
    ...(scrollTrigger
      ? {
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            once: true,
          },
        }
      : {}),
  });
}

/**
 * FadeRight (from x: 24).
 * Replaces: variants={fadeRight}
 */
export function createFadeRight(
  element: Element,
  options?: { duration?: number; ease?: string; scrollTrigger?: boolean },
) {
  const {
    duration = DURATION_ENTRY,
    ease = GSAP_EASE,
    scrollTrigger = true,
  } = options ?? {};

  return gsap.from(element, {
    opacity: 0,
    x: OFFSET_X,
    duration,
    ease,
    immediateRender: true,
    onComplete() {
      gsap.set(element, { clearProps: "transform,opacity" });
    },
    ...(scrollTrigger
      ? {
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            once: true,
          },
        }
      : {}),
  });
}

/**
 * Simple fade-in (opacity only).
 * Replaces: initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
 */
export function createFadeIn(
  element: Element,
  options?: { duration?: number; delay?: number; scrollTrigger?: boolean },
) {
  const { duration = 0.5, delay = 0, scrollTrigger = true } = options ?? {};

  return gsap.from(element, {
    opacity: 0,
    duration,
    delay,
    immediateRender: true,
    onComplete() {
      gsap.set(element, { clearProps: "opacity" });
    },
    ...(scrollTrigger
      ? {
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            once: true,
          },
        }
      : {}),
  });
}

export { gsap, ScrollTrigger };
