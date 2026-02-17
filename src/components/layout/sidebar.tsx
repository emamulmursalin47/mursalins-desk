"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SPRING_EASE, SPRING_DURATION } from "@/lib/gsap";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/skills", label: "Tech Stack" },
  { href: "/dashboard/experiences", label: "Experience" },
  { href: "/dashboard/blog", label: "Blog" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/reviews", label: "Reviews" },
  { href: "/dashboard/appointments", label: "Appointments" },
  { href: "/dashboard/testimonials", label: "Testimonials" },
  { href: "/dashboard/contacts", label: "Contacts" },
  { href: "/dashboard/chat", label: "Chat" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/settings", label: "Settings" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const asideRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (asideRef.current && window.innerWidth >= 1024) {
      gsap.from(asideRef.current, {
        x: -264,
        opacity: 0,
        duration: SPRING_DURATION,
        ease: SPRING_EASE,
        onComplete() { gsap.set(asideRef.current, { clearProps: "transform,opacity" }); },
      });
    }
  });

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        ref={asideRef}
        className={`glass-heavy fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Glass shine overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-r-2xl bg-linear-to-br from-white/20 via-transparent to-transparent" />

        <div className="flex h-16 items-center px-6">
          <Link
            href="/dashboard"
            className="text-lg font-bold tracking-tight text-foreground"
          >
            Mursalin<span className="text-primary-500">&apos;s Desk</span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => onClose()}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 ${
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

        <div className="border-t border-glass-border p-4">
          <Link
            href="/"
            className="glass-subtle flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
          >
            &larr; Back to Site
          </Link>
        </div>
      </aside>
    </>
  );
}
