"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SPRING_EASE, SPRING_DURATION } from "@/lib/gsap";
import { usePortalDrawer } from "@/contexts/portal-drawer-context";

const portalLinks = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/projects", label: "My Projects" },
  { href: "/portal/orders", label: "My Orders" },
  { href: "/portal/reviews", label: "My Reviews" },
  { href: "/portal/appointments", label: "Appointments" },
  { href: "/portal/profile", label: "My Profile" },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const { drawerOpen, setDrawerOpen } = usePortalDrawer();

  const desktopRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Desktop entrance animation
  useGSAP(() => {
    if (desktopRef.current) {
      gsap.from(desktopRef.current, {
        x: -264,
        opacity: 0,
        duration: SPRING_DURATION,
        ease: SPRING_EASE,
        onComplete() { gsap.set(desktopRef.current, { clearProps: "transform,opacity" }); },
      });
    }
  });

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname, setDrawerOpen]);

  // iOS-safe body scroll lock
  useEffect(() => {
    if (drawerOpen) {
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
  }, [drawerOpen]);

  // Mobile drawer GSAP animation
  useGSAP(
    () => {
      if (!overlayRef.current || !drawerRef.current) return;
      const items = drawerRef.current.querySelectorAll("[data-menu-item]");

      if (drawerOpen) {
        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
        gsap.to(drawerRef.current, {
          x: 0,
          duration: SPRING_DURATION,
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
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
        });
        gsap.to(drawerRef.current, {
          x: "-100%",
          duration: 0.3,
          ease: "power2.in",
        });
        gsap.to(items, { opacity: 0, x: -12, duration: 0.2 });
      }
    },
    { dependencies: [drawerOpen] },
  );

  function renderNav(isDesktop: boolean) {
    return (
      <>
        <div className="flex h-16 items-center px-6">
          <Link
            href="/portal"
            className="text-lg font-bold tracking-tight text-foreground"
          >
            Client<span className="text-primary-500"> Portal</span>
          </Link>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {portalLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/portal" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                {...(!isDesktop ? { "data-menu-item": true } : {})}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                  isActive
                    ? "text-primary-600"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`glass absolute inset-0 rounded-xl transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4">
          <Link
            href="/"
            {...(!isDesktop ? { "data-menu-item": true } : {})}
            className="glass-subtle flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            &larr; Back to Site
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop sidebar — visible lg+ */}
      <aside
        ref={desktopRef}
        className="glass-heavy fixed inset-y-0 left-0 z-40 hidden w-64 flex-col lg:flex"
      >
        <div className="pointer-events-none absolute inset-0 rounded-r-2xl bg-linear-to-br from-white/20 via-transparent to-transparent" />
        {renderNav(true)}
      </aside>

      {/* Mobile overlay */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden ${
          drawerOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{ opacity: 0 }}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer panel */}
      <div
        id="portal-mobile-drawer"
        ref={drawerRef}
        className="glass-heavy fixed inset-y-0 left-0 z-50 flex w-72 flex-col lg:hidden"
        style={{ transform: "translateX(-100%)" }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="pointer-events-none absolute inset-0 rounded-r-2xl bg-linear-to-br from-white/20 via-transparent to-transparent" />
        {renderNav(false)}
      </div>
    </>
  );
}
