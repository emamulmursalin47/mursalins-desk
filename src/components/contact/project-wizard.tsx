"use client";

import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { submitQuote } from "@/app/(public)/contact/actions";
import { WizardSuccess } from "@/components/contact/wizard-success";
import type { Service } from "@/types/api";

const inputClass =
  "glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-ring focus:ring-2 transition-shadow";

const budgetOptions = [
  "$1K – $5K",
  "$5K – $10K",
  "$10K – $25K",
  "$25K – $50K",
  "$50K+",
];

const timelineOptions = [
  "< 1 month",
  "1–3 months",
  "3–6 months",
  "6+ months",
  "Flexible",
];

const stepLabels = ["Service", "Details", "Budget", "Info"];

interface WizardData {
  serviceType: string;
  description: string;
  features: string;
  budget: string;
  timeline: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

interface ProjectWizardProps {
  services: Service[];
  preselectedService?: string;
}

export function ProjectWizard({
  services,
  preselectedService,
}: ProjectWizardProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WizardData>({
    serviceType: preselectedService || "",
    description: "",
    features: "",
    budget: "",
    timeline: "",
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  const stepContentRef = useRef<HTMLDivElement>(null);

  // Animate step transitions
  useGSAP(
    () => {
      if (!stepContentRef.current) return;
      gsap.fromTo(
        stepContentRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
      );
    },
    { dependencies: [step] },
  );

  // Auto-advance if preselected service
  useEffect(() => {
    if (preselectedService && step === 0) {
      const match = services.find(
        (s) => s.slug === preselectedService || s.title === preselectedService,
      );
      if (match) {
        setData((d) => ({ ...d, serviceType: match.title }));
        setStep(1);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function update(field: keyof WizardData, value: string) {
    setData((d) => ({ ...d, [field]: value }));
  }

  function canContinue(): boolean {
    switch (step) {
      case 0:
        return !!data.serviceType;
      case 1:
        return !!data.description.trim();
      case 2:
        return true; // budget/timeline are optional
      case 3:
        return !!data.name.trim() && !!data.email.trim();
      default:
        return false;
    }
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);

    const result = await submitQuote({
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      company: data.company || undefined,
      serviceType: data.serviceType,
      description: data.description + (data.features ? `\n\nKey features/requirements:\n${data.features}` : ""),
      budget: data.budget || undefined,
      timeline: data.timeline || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message || "Something went wrong.");
    }
  }

  if (success) return <WizardSuccess />;

  return (
    <div className="glass-card glass-shine rounded-2xl p-6 sm:p-8">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                i === step
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/30"
                  : i < step
                    ? "bg-primary-100 text-primary-700 cursor-pointer hover:bg-primary-200"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? (
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </button>
            <span
              className={`hidden text-xs font-medium sm:block ${
                i === step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < stepLabels.length - 1 && (
              <div
                className={`h-px w-6 sm:w-10 ${
                  i < step ? "bg-primary-300" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div ref={stepContentRef}>
        {step === 0 && (
          <StepService
            services={services}
            selected={data.serviceType}
            onSelect={(v) => {
              update("serviceType", v);
              setTimeout(() => setStep(1), 200);
            }}
          />
        )}
        {step === 1 && (
          <StepDetails
            description={data.description}
            features={data.features}
            onChange={update}
          />
        )}
        {step === 2 && (
          <StepBudget
            budget={data.budget}
            timeline={data.timeline}
            onChange={update}
          />
        )}
        {step === 3 && (
          <StepInfo
            name={data.name}
            email={data.email}
            phone={data.phone}
            company={data.company}
            onChange={update}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        {step > 0 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="btn-outline-glass rounded-xl px-5 py-2 text-sm font-medium text-muted-foreground"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canContinue()}
            className="btn-glass-primary rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canContinue() || submitting}
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
                Submitting...
              </span>
            ) : (
              "Submit Request"
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Step 0: Select Service ── */

function StepService({
  services,
  selected,
  onSelect,
}: {
  services: Service[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-1 text-lg font-semibold text-foreground">
        What do you need?
      </h3>
      <p className="mb-6 text-sm text-muted-foreground">
        Select the service that best matches your project
      </p>

      {services.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {services
            .filter((s) => s.isActive)
            .map((service) => (
              <button
                key={service.id}
                onClick={() => onSelect(service.title)}
                className={`glass rounded-xl p-4 text-left transition-all duration-200 ${
                  selected === service.title
                    ? "ring-2 ring-primary-500 shadow-md shadow-primary-500/10"
                    : "hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3">
                  {service.iconUrl && (
                    <span className="text-xl">{service.iconUrl}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-foreground">
                      {service.title}
                    </h4>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {service.description}
                    </p>
                    {service.price && (
                      <p className="mt-2 text-xs font-medium text-primary-600">
                        From ${service.price}
                      </p>
                    )}
                  </div>
                  {selected === service.title && (
                    <svg
                      className="h-5 w-5 shrink-0 text-primary-500"
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
                  )}
                </div>
              </button>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            "Web Development",
            "Mobile App",
            "UI/UX Design",
            "E-Commerce",
            "API Development",
            "Other",
          ].map((s) => (
            <button
              key={s}
              onClick={() => onSelect(s)}
              className={`glass rounded-xl p-4 text-left text-sm font-medium transition-all duration-200 ${
                selected === s
                  ? "ring-2 ring-primary-500 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:shadow-md"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Step 1: Project Details ── */

function StepDetails({
  description,
  features,
  onChange,
}: {
  description: string;
  features: string;
  onChange: (field: keyof WizardData, value: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-1 text-lg font-semibold text-foreground">
        Tell me about your project
      </h3>
      <p className="mb-6 text-sm text-muted-foreground">
        The more detail you provide, the better I can help
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="pw-desc"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Project Description <span className="text-destructive">*</span>
          </label>
          <textarea
            id="pw-desc"
            required
            rows={5}
            placeholder="Describe your project goals, target audience, and expected outcomes..."
            value={description}
            onChange={(e) => onChange("description", e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label
            htmlFor="pw-features"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Key Features / Requirements
          </label>
          <textarea
            id="pw-features"
            rows={3}
            placeholder="List specific features or requirements (optional)..."
            value={features}
            onChange={(e) => onChange("features", e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Step 2: Budget & Timeline ── */

function StepBudget({
  budget,
  timeline,
  onChange,
}: {
  budget: string;
  timeline: string;
  onChange: (field: keyof WizardData, value: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-1 text-lg font-semibold text-foreground">
        Budget & Timeline
      </h3>
      <p className="mb-6 text-sm text-muted-foreground">
        This helps me tailor a proposal to your needs (optional)
      </p>

      <div className="flex flex-col gap-6">
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground">
            Estimated Budget
          </label>
          <div className="flex flex-wrap gap-2">
            {budgetOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => onChange("budget", budget === opt ? "" : opt)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  budget === opt
                    ? "glass-heavy ring-2 ring-primary-500 text-foreground"
                    : "glass-subtle text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-foreground">
            Expected Timeline
          </label>
          <div className="flex flex-wrap gap-2">
            {timelineOptions.map((opt) => (
              <button
                key={opt}
                onClick={() =>
                  onChange("timeline", timeline === opt ? "" : opt)
                }
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  timeline === opt
                    ? "glass-heavy ring-2 ring-primary-500 text-foreground"
                    : "glass-subtle text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step 3: Contact Info ── */

function StepInfo({
  name,
  email,
  phone,
  company,
  onChange,
}: {
  name: string;
  email: string;
  phone: string;
  company: string;
  onChange: (field: keyof WizardData, value: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-1 text-lg font-semibold text-foreground">
        Your Information
      </h3>
      <p className="mb-6 text-sm text-muted-foreground">
        How can I reach you to discuss the project?
      </p>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="pw-name"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="pw-name"
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => onChange("name", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="pw-email"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Email <span className="text-destructive">*</span>
            </label>
            <input
              id="pw-email"
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => onChange("email", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="pw-phone"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Phone
            </label>
            <input
              id="pw-phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="pw-company"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Company
            </label>
            <input
              id="pw-company"
              type="text"
              placeholder="Your company name"
              value={company}
              onChange={(e) => onChange("company", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
