"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SPRING_EASE, SPRING_DURATION } from "@/lib/gsap";
import { useAuth } from "@/contexts/auth-context";
import { usePortalDrawer } from "@/contexts/portal-drawer-context";

export function PortalHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const { user, logout } = useAuth();
  const { drawerOpen, setDrawerOpen } = usePortalDrawer();

  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        y: -56,
        opacity: 0,
        duration: SPRING_DURATION,
        ease: SPRING_EASE,
        delay: 0.15,
      });
    }
  });

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: SPRING_EASE } });
      if (drawerOpen) {
        tl.to(line1Ref.current, { rotation: 45, y: 6, duration: 0.3 })
          .to(line2Ref.current, { opacity: 0, duration: 0.15 }, 0)
          .to(line3Ref.current, { rotation: -45, y: -6, duration: 0.3 }, 0);
      } else {
        tl.to(line1Ref.current, { rotation: 0, y: 0, duration: 0.3 })
          .to(line2Ref.current, { opacity: 1, duration: 0.15 }, 0)
          .to(line3Ref.current, { rotation: 0, y: 0, duration: 0.3 }, 0);
      }
    },
    { dependencies: [drawerOpen] },
  );

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user?.firstName?.[0] || "U";

  return (
    <header
      ref={headerRef}
      className="glass sticky top-0 z-30 flex h-14 items-center px-4 sm:px-6"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger — visible below lg */}
          <button
            onClick={() => setDrawerOpen((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 active:scale-90 lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
            aria-controls="portal-mobile-drawer"
          >
            <span className="flex flex-col items-center justify-center gap-1">
              <span ref={line1Ref} className="block h-0.5 w-5 bg-foreground" />
              <span ref={line2Ref} className="block h-0.5 w-5 bg-foreground" />
              <span ref={line3Ref} className="block h-0.5 w-5 bg-foreground" />
            </span>
          </button>

          <h2 className="text-lg font-semibold text-foreground lg:hidden">
            Client<span className="text-primary-500"> Portal</span>
          </h2>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-muted-foreground sm:block">
              {user.firstName} {user.lastName}
            </span>
          )}

          <div className="glass-subtle flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-primary-600 uppercase">
            {initials}
          </div>

          <button
            onClick={logout}
            className="glass-subtle min-h-11 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
