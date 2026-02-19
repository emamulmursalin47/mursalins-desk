"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useChat } from "@/contexts/chat-context";

const inputClass =
  "w-full rounded-xl border border-foreground/10 bg-white/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-ring focus:ring-2 focus:border-primary-500/30 transition-shadow";

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
      className="absolute inset-x-0 bottom-0 top-[52px] z-10 flex flex-col overflow-hidden bg-[oklch(0.97_0.003_265)] backdrop-blur-sm"
    >
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Header */}
        <div className="mb-4 text-center">
          <h3 className="text-sm font-semibold text-foreground">
            {isAdminOnline ? "Talk to Mursalin" : "Leave a Message"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAdminOnline
              ? "Share your details so Mursalin can connect with you"
              : "Mursalin is away — typically replies within 2 hours"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            required
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            autoFocus
          />
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <textarea
            required
            placeholder="How can Mursalin help?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
          />
          <button
            type="submit"
            className="btn-glass-primary w-full rounded-xl py-2.5 text-sm font-semibold text-white"
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
