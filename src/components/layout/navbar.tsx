"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SPRING_EASE, SPRING_DURATION } from "@/lib/gsap";
import { Container } from "@/components/layout/container";
import { useAuth } from "@/contexts/auth-context";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOverflow, setNavOverflow] = useState<"hidden" | "visible">("hidden");

  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const navContentRef = useRef<HTMLDivElement>(null);
  const navListRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLLIElement>(null);
  const isFirstPill = useRef(true);
  const entranceDone = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pillWave1Ref = useRef<HTMLSpanElement>(null);
  const pillWave2Ref = useRef<HTMLSpanElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);

  // Navbar entrance animation — slide down then expand
  useGSAP(() => {
    const nav = navRef.current;
    const content = navContentRef.current;
    if (!nav || !content) return;

    const targetRadius = getComputedStyle(nav).borderRadius;

    // Initial state: small pill, content hidden
    gsap.set(nav, {
      width: 56,
      borderRadius: "9999px",
      margin: "1rem auto 0",
      willChange: "width, border-radius, transform",
    });
    gsap.set(content, { opacity: 0 });

    const tl = gsap.timeline({
      delay: 0.1,
      onComplete: () => {
        gsap.set(nav, {
          clearProps: "width,borderRadius,margin,willChange,overflow",
        });
        gsap.set(content, { clearProps: "opacity" });
        setNavOverflow("visible");
      },
    });

    // Step 1: Slide down smoothly (no bounce)
    tl.from(nav, {
      y: -40,
      opacity: 0,
      duration: 0.5,
      ease: "power3.out",
      force3D: true,
    });

    // Step 2: Expand to full width
    tl.set(nav, { borderRadius: targetRadius });
    tl.to(nav, {
      width: "100%",
      duration: 0.7,
      ease: "expo.out",
    });

    // Content reveals during expansion
    tl.to(
      content,
      {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        onStart: () => {
          entranceDone.current = true;
          isFirstPill.current = true;
          updatePill();
        },
      },
      "<0.1",
    );
  });

  // Scroll listener — rAF-throttled to avoid excessive state updates
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change (back/forward navigation)
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open (iOS-safe)
  useEffect(() => {
    if (menuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) window.scrollTo(0, parseInt(scrollY) * -1);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Sliding pill — measures active link and animates pill to it
  const updatePill = useCallback(() => {
    if (!navListRef.current || !pillRef.current || !entranceDone.current)
      return;
    const activeLi = navListRef.current.querySelector<HTMLElement>(
      "[data-nav-active='true']",
    );
    if (!activeLi) {
      gsap.to(pillRef.current, { opacity: 0, duration: 0.2 });
      return;
    }
    const {
      offsetLeft: x,
      offsetTop: y,
      offsetWidth: width,
      offsetHeight: height,
    } = activeLi;
    if (isFirstPill.current) {
      gsap.set(pillRef.current, { x, y, width, height, opacity: 1 });
      isFirstPill.current = false;
    } else {
      // Slide the pill
      gsap.to(pillRef.current, {
        x,
        y,
        width,
        height,
        opacity: 1,
        duration: SPRING_DURATION,
        ease: SPRING_EASE,
        force3D: true,
      });

      // Water slosh — inertia pushes water opposite to slide direction, then settles
      if (pillWave1Ref.current && pillWave2Ref.current) {
        const currentX = gsap.getProperty(pillRef.current, "x") as number;
        const dx = x - currentX;
        const inertiaX = dx > 0 ? -30 : 30;

        gsap.killTweensOf(pillWave1Ref.current);
        gsap.killTweensOf(pillWave2Ref.current);

        // Wave 1 — horizontal slosh + rotation burst
        gsap.fromTo(
          pillWave1Ref.current,
          { x: inertiaX, rotation: "+=0" },
          {
            x: 0,
            rotation: "+=120",
            duration: 1,
            ease: "elastic.out(1, 0.3)",
          },
        );

        // Wave 2 — offset amplitude + counter-rotation
        gsap.fromTo(
          pillWave2Ref.current,
          { x: inertiaX * 0.65 },
          {
            x: 0,
            rotation: "-=90",
            duration: 1.2,
            ease: "elastic.out(1, 0.35)",
          },
        );

        // Pill body wobble — squish then bounce
        gsap.fromTo(
          pillRef.current,
          { scaleY: 0.88 },
          { scaleY: 1, duration: 0.6, ease: "elastic.out(1.2, 0.4)" },
        );
      }
    }
  }, []);

  useEffect(() => {
    updatePill();
  }, [pathname, updatePill]);

  // Reposition pill on resize — rAF-debounced to avoid layout thrashing
  useEffect(() => {
    let raf: number;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updatePill);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [updatePill]);

  // Hamburger icon animation — single timeline instead of 3 separate tweens
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: SPRING_EASE } });
      if (menuOpen) {
        tl.to(line1Ref.current, { rotation: 45, y: 6, duration: 0.3 })
          .to(line2Ref.current, { opacity: 0, duration: 0.15 }, 0)
          .to(line3Ref.current, { rotation: -45, y: -6, duration: 0.3 }, 0);
      } else {
        tl.to(line1Ref.current, { rotation: 0, y: 0, duration: 0.3 })
          .to(line2Ref.current, { opacity: 1, duration: 0.15 }, 0)
          .to(line3Ref.current, { rotation: 0, y: 0, duration: 0.3 }, 0);
      }
    },
    { dependencies: [menuOpen] },
  );

  // Mobile dropdown animation
  useGSAP(
    () => {
      if (!dropdownRef.current) return;
      const items = dropdownRef.current.querySelectorAll("[data-menu-item]");

      if (menuOpen) {
        gsap.to(dropdownRef.current, {
          height: "auto",
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: SPRING_EASE,
        });
        gsap.fromTo(
          items,
          { opacity: 0, x: -12 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.05,
            duration: 0.3,
            ease: SPRING_EASE,
          },
        );
      } else {
        gsap.to(dropdownRef.current, {
          height: 0,
          opacity: 0,
          scale: 0.95,
          duration: 0.3,
          ease: SPRING_EASE,
        });
        gsap.to(items, { opacity: 0, x: -12, duration: 0.2 });
      }
    },
    { dependencies: [menuOpen] },
  );

  return (
    <header ref={headerRef} className="fixed top-0 right-0 left-0 z-50">
      <Container>
        <nav
          ref={navRef}
          className={`glass glass-shine mt-4 rounded-2xl transition-[box-shadow,height] duration-300 ${
            scrolled
              ? "h-12 shadow-(--nav-shadow-scrolled)"
              : "h-14 shadow-(--nav-shadow-default)"
          }`}
          style={{ overflow: navOverflow }}
        >
          <div
            ref={navContentRef}
            className="mx-5 flex h-full items-center justify-between sm:mx-8"
          >
            {/* Logo */}
            <Link
              href="/"
              className="relative z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2"
            >
              <span className="font-display text-xl font-bold tracking-tight text-foreground drop-shadow-sm">
                Mursalin
              </span>
            </Link>

            {/* Desktop nav links */}
            <ul
              ref={navListRef}
              className="relative hidden items-center gap-0.5 md:flex"
            >
              {/* Sliding pill — tinted glass with water inside */}
              <li
                ref={pillRef}
                className="pointer-events-none absolute left-0 top-0 will-change-transform rounded-full nav-pill-liquid"
                style={{ opacity: 0 }}
                aria-hidden="true"
              >
                {/* Water clip container */}
                <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                  {/* Wave blob 1 — still at rest, animated on slide */}
                  <span
                    ref={pillWave1Ref}
                    className="nav-pill-wave-1"
                  />
                  {/* Wave blob 2 — offset for depth */}
                  <span
                    ref={pillWave2Ref}
                    className="nav-pill-wave-2"
                  />
                </span>
                {/* Glass highlight — light refraction on top surface */}
                <span
                  className="absolute inset-0 rounded-full pointer-events-none nav-pill-highlight"
                />
              </li>
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <li
                    key={link.href}
                    data-nav-active={isActive ? "true" : "false"}
                  >
                    <Link
                      href={link.href}
                      className={`relative block rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 ${
                        isActive
                          ? "text-primary-600"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* CTA buttons + Mobile toggle */}
            <div className="flex items-center gap-3">
              {/* Auth link — Sign In or Dashboard/Portal */}
              <Link
                href={
                  isAuthenticated
                    ? user?.role === "ADMIN"
                      ? "/dashboard"
                      : "/portal"
                    : "/login"
                }
                className="hidden rounded-lg text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 sm:inline-flex"
              >
                {isAuthenticated
                  ? user?.role === "ADMIN"
                    ? "Dashboard"
                    : "My Portal"
                  : "Sign In"}
              </Link>

              {/* Separator */}
              <div className="hidden h-5 w-px bg-foreground/15 sm:block" />

              {/* Visit Store — premium accent button */}
              <Link
                href="/store"
                className="btn-store hidden items-center gap-1.5 rounded-l-full! rounded-r-xl! px-4 py-1.5 text-xs font-semibold tracking-wide text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 sm:inline-flex"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Visit Store
              </Link>

              {/* Hire Me — filled primary button */}
              <Link
                href="/contact"
                className="btn-glass-primary hidden items-center rounded-l-xl! rounded-r-full! px-5 py-1.5 text-sm font-semibold tracking-wide text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 sm:inline-flex"
              >
                Hire Me
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-11 w-11 flex-col items-center justify-center gap-1 rounded-full transition-all duration-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 md:hidden"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-dropdown"
              >
                <span
                  ref={line1Ref}
                  className="block h-0.5 w-5 bg-foreground"
                />
                <span
                  ref={line2Ref}
                  className="block h-0.5 w-5 bg-foreground"
                />
                <span
                  ref={line3Ref}
                  className="block h-0.5 w-5 bg-foreground"
                />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile dropdown */}
        <div
          id="mobile-nav-dropdown"
          ref={dropdownRef}
          className="mt-1 overflow-hidden rounded-2xl bg-background/95 backdrop-blur-xl shadow-lg border border-glass-border md:hidden"
          style={{ height: 0, opacity: 0 }}
        >
          <ul className="flex flex-col gap-1 p-3">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <li key={link.href} data-menu-item>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 ${
                      isActive
                        ? "glass-subtle text-primary-600"
                        : "text-muted-foreground hover:bg-white/40 hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li data-menu-item className="grid grid-cols-2 gap-2">
              <Link
                href={
                  isAuthenticated
                    ? user?.role === "ADMIN"
                      ? "/dashboard"
                      : "/portal"
                    : "/login"
                }
                onClick={() => setMenuOpen(false)}
                className="btn-outline-glass block rounded-full px-4 py-2.5 text-center text-sm font-medium text-muted-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2"
              >
                {isAuthenticated
                  ? user?.role === "ADMIN"
                    ? "Dashboard"
                    : "My Portal"
                  : "Sign In"}
              </Link>
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="btn-glass-primary block rounded-l-md rounded-r-full px-4 py-2.5 text-center text-sm font-semibold tracking-wide text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2"
              >
                Hire Me
              </Link>
            </li>
            <li data-menu-item>
              <Link
                href="/store"
                onClick={() => setMenuOpen(false)}
                className="btn-store flex items-center justify-center gap-2 rounded-l-full rounded-r-md px-4 py-2.5 text-sm font-semibold tracking-wide text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Visit Store
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </header>
  );
}
