import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="mx-auto max-w-lg text-center">
        {/* 404 number */}
        <p className="font-display text-8xl font-bold tracking-tight text-primary-200 sm:text-9xl">
          404
        </p>

        {/* Message */}
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Navigation links */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="btn-glass-primary inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold text-white"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="glass glass-shine inline-flex items-center rounded-full px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact Me
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 glass glass-shine rounded-2xl p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Popular pages
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              { href: "/projects", label: "Projects" },
              { href: "/services", label: "Services" },
              { href: "/blog", label: "Blog" },
              { href: "/store", label: "Store" },
              { href: "/pricing", label: "Pricing" },
              { href: "/about", label: "About" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-glass-border bg-glass px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-glass-heavy hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
