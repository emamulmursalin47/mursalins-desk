"use client";

import { useRef, useState, useTransition } from "react";
import { useGSAP } from "@gsap/react";
import { createStaggerFadeUp } from "@/lib/gsap";
import { Container } from "@/components/layout/container";
import { subscribeNewsletter } from "@/app/(public)/newsletter/actions";

export function NewsletterContact() {
  const gridRef = useRef<HTMLDivElement>(null);

  /* Newsletter form state */
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const res = await subscribeNewsletter(email);
      setResult({ success: res.success, message: res.message ?? "" });
      if (res.success) setEmail("");
    });
  }

  useGSAP(() => {
    if (!gridRef.current) return;
    createStaggerFadeUp(gridRef.current, "[data-animate]");
  });

  return (
    <section className="relative py-16">
      <Container>
      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-8 lg:grid-cols-2"
      >
        {/* Newsletter */}
        <div className="glass-card glass-shine rounded-2xl p-8" data-animate>
          <h3 className="text-xl font-bold text-foreground">
            Stay in the Loop
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get notified about new projects, digital products, and articles.
            No spam, unsubscribe anytime.
          </p>

          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={handleSubscribe}
          >
            <input
              type="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
              className="glass-subtle flex-1 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-ring focus:ring-2 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={pending}
              className="shrink-0 rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/20 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {pending ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          {result && (
            <p
              className={`mt-3 text-sm font-medium ${
                result.success ? "text-green-500" : "text-red-400"
              }`}
            >
              {result.message}
            </p>
          )}
        </div>

        {/* Quick Contact */}
        <div className="glass-card glass-shine rounded-2xl p-8" data-animate>
          <h3 className="text-xl font-bold text-foreground">Quick Message</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Have a question? Drop me a line and I&apos;ll get back to you
            within 24 hours.
          </p>

          <form
            className="mt-6 flex flex-col gap-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Name"
                required
                className="glass-subtle rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-ring focus:ring-2"
              />
              <input
                type="email"
                placeholder="Email"
                required
                className="glass-subtle rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-ring focus:ring-2"
              />
            </div>
            <textarea
              placeholder="Your message..."
              rows={3}
              required
              className="glass-subtle rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-ring focus:ring-2 resize-none"
            />
            <button
              type="submit"
              className="self-start rounded-xl bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-lg hover:shadow-accent-500/20"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
      </Container>
    </section>
  );
}
