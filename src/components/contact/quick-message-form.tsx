"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, createStaggerFadeUp } from "@/lib/gsap";
import { submitContact } from "@/app/(public)/contact/actions";

const inputClass =
  "glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-ring focus:ring-2 transition-shadow";

export function QuickMessageForm() {
  const formRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useGSAP(() => {
    if (!formRef.current) return;
    createStaggerFadeUp(formRef.current, "[data-animate]");
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await submitContact({
      name,
      email,
      message,
      subject: subject || undefined,
      source: "contact-page",
    });

    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
      // Animate success in
      if (successRef.current) {
        gsap.fromTo(
          successRef.current,
          { opacity: 0, y: 12, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)" },
        );
      }
    } else {
      setError(result.message || "Something went wrong.");
    }
  }

  if (success) {
    return (
      <div
        ref={successRef}
        className="glass-card glass-shine rounded-2xl p-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <svg
            className="h-8 w-8 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground">Message Sent!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          I&apos;ll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div ref={formRef} className="glass-card glass-shine rounded-2xl p-6 sm:p-8">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div
          data-animate
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div>
            <label
              htmlFor="qm-name"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="qm-name"
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="qm-email"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Email <span className="text-destructive">*</span>
            </label>
            <input
              id="qm-email"
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div data-animate>
          <label
            htmlFor="qm-subject"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Subject
          </label>
          <input
            id="qm-subject"
            type="text"
            placeholder="What's this about?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClass}
          />
        </div>

        <div data-animate>
          <label
            htmlFor="qm-message"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Message <span className="text-destructive">*</span>
          </label>
          <textarea
            id="qm-message"
            required
            rows={5}
            placeholder="Tell me about your project or question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div data-animate>
          <button
            type="submit"
            disabled={submitting}
            className="btn-glass-primary rounded-xl px-8 py-2.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Sending...
              </span>
            ) : (
              "Send Message"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
