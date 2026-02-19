"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useChat } from "@/contexts/chat-context";

const inputClass =
  "glass-subtle w-full rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-ring focus:ring-2 transition-shadow";

const compactInputClass =
  "glass-subtle w-full rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none ring-ring focus:ring-1 transition-shadow";

export function ChatLeadForm() {
  const { leadFormMode, submitLeadForm, dismissLeadForm, visitorInfo, isAdminOnline } =
    useChat();
  const [name, setName] = useState(visitorInfo?.name ?? "");
  const [email, setEmail] = useState(visitorInfo?.email ?? "");
  const [question, setQuestion] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 12, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.4)" },
      );
    }
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    if (leadFormMode === "escalation" && !question.trim()) return;
    submitLeadForm(name.trim(), email.trim(), question.trim() || undefined);
  }

  // Soft mode — inline message bubble
  if (leadFormMode === "soft") {
    return (
      <div ref={formRef} className="flex justify-start px-4">
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm glass-subtle px-3.5 py-3">
          <p className="mb-2.5 text-sm leading-relaxed text-foreground">
            {isAdminOnline
              ? "Mind sharing your name and email? This helps Mursalin follow up on our conversation."
              : "Share your email so Mursalin can reply when he's back. He typically responds within 2 hours."}
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={compactInputClass}
            />
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={compactInputClass}
            />
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="submit"
                className="btn-glass-primary rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
              >
                Share
              </button>
              <button
                type="button"
                onClick={dismissLeadForm}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Maybe later
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Escalation mode — full overlay
  return (
    <div
      ref={formRef}
      className="absolute inset-x-0 bottom-0 top-[52px] z-10 flex flex-col overflow-hidden bg-[oklch(0.98_0.003_265/0.97)] backdrop-blur-sm"
    >
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/15">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-blue-400"
            >
              <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {isAdminOnline ? "Talk to Mursalin" : "Leave a Message"}
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {isAdminOnline
              ? "Share your details to connect"
              : "Mursalin is away — typically replies within 2 hours"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="text"
              required
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={compactInputClass}
              autoFocus
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={compactInputClass}
            />
          </div>
          <textarea
            required
            placeholder="How can Mursalin help?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            className={`${compactInputClass} resize-none`}
          />
          <button
            type="submit"
            className="btn-glass-primary w-full rounded-xl py-2 text-sm font-semibold text-white"
          >
            {isAdminOnline ? "Connect with Mursalin" : "Send Message"}
          </button>
          <button
            type="button"
            onClick={dismissLeadForm}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to chat
          </button>
        </form>
      </div>
    </div>
  );
}
