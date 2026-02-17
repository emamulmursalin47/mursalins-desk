"use client";

import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { createStaggerFadeUp } from "@/lib/gsap";
import { Container } from "@/components/layout/container";
import { BookingCalendar } from "@/components/appointments/booking-calendar";
import { TimeSlotPicker } from "@/components/appointments/time-slot-picker";
import { BookingSuccess } from "@/components/appointments/booking-success";
import { bookAppointment } from "@/app/(public)/appointments/actions";

const inputClass =
  "glass-subtle w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-ring focus:ring-2 transition-shadow";

const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "GMT / London" },
  { value: "Europe/Berlin", label: "CET / Berlin" },
  { value: "Asia/Kolkata", label: "IST / India" },
  { value: "Asia/Tokyo", label: "JST / Tokyo" },
  { value: "Asia/Dhaka", label: "BST / Dhaka" },
  { value: "Australia/Sydney", label: "AEST / Sydney" },
  { value: "UTC", label: "UTC" },
];

export function BookingForm() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timezone, setTimezone] = useState("UTC");
  const [callType, setCallType] = useState<"VIDEO" | "CALL">("VIDEO");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect timezone
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) setTimezone(detected);
    } catch {
      // fallback to UTC
    }
  }, []);

  useGSAP(() => {
    if (!containerRef.current) return;
    createStaggerFadeUp(containerRef.current, "[data-animate]", {
      scrollTrigger: true,
    });
  });

  function buildISODate(): string {
    if (!selectedDate || !selectedTime) return "";
    const parts = selectedTime.split(":").map(Number);
    const hours = parts[0] ?? 0;
    const minutes = parts[1] ?? 0;
    const d = new Date(selectedDate);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time.");
      return;
    }

    if (!name.trim() || !email.trim()) {
      setError("Please fill in your name and email.");
      return;
    }

    setSubmitting(true);

    const result = await bookAppointment({
      name,
      email,
      phone: phone || undefined,
      date: buildISODate(),
      duration: 30,
      topic: topic || undefined,
      notes: notes || undefined,
      timezone,
      type: callType,
    });

    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message || "Something went wrong.");
    }
  }

  if (success && selectedDate && selectedTime) {
    const dateLabel = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const h = selectedTime.split(":")[0] ?? "0";
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const display = hour > 12 ? hour - 12 : hour;
    const timeLabel = `${display}:00 ${suffix}`;

    return (
      <section className="relative py-16">
        <Container>
          <BookingSuccess
            date={dateLabel}
            time={timeLabel}
            timezone={timezone}
          />
        </Container>
      </section>
    );
  }

  return (
    <section className="relative py-16">
      <Container>
        <div ref={containerRef} className="mx-auto max-w-5xl">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-8 lg:grid-cols-2"
          >
            {/* Left: Calendar + Time */}
            <div data-animate className="glass-card glass-shine rounded-2xl p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">
                Select Date & Time
              </h3>
              <BookingCalendar
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
              />
              {selectedDate && (
                <div className="mt-6">
                  <TimeSlotPicker
                    selectedTime={selectedTime}
                    onSelect={setSelectedTime}
                  />
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div data-animate className="glass-card glass-shine rounded-2xl p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">
                Appointment Details
              </h3>

              {/* Timezone */}
              <div className="mb-4">
                <label
                  htmlFor="bk-tz"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Timezone
                </label>
                <select
                  id="bk-tz"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className={inputClass}
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                  {/* Include detected timezone if not in common list */}
                  {!COMMON_TIMEZONES.some((t) => t.value === timezone) && (
                    <option value={timezone}>{timezone}</option>
                  )}
                </select>
              </div>

              {/* Call type */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Call Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCallType("VIDEO")}
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                      callType === "VIDEO"
                        ? "glass-heavy ring-2 ring-primary-500 text-primary-600"
                        : "glass-subtle text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                    Video Call
                  </button>
                  <button
                    type="button"
                    onClick={() => setCallType("CALL")}
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                      callType === "CALL"
                        ? "glass-heavy ring-2 ring-primary-500 text-primary-600"
                        : "glass-subtle text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                      />
                    </svg>
                    Phone Call
                  </button>
                </div>
              </div>

              {/* Contact fields */}
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="bk-name"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="bk-name"
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
                      htmlFor="bk-email"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Email <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="bk-email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="bk-phone"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Phone
                  </label>
                  <input
                    id="bk-phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="bk-topic"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Topic
                  </label>
                  <input
                    id="bk-topic"
                    type="text"
                    placeholder="What would you like to discuss?"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="bk-notes"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Notes
                  </label>
                  <textarea
                    id="bk-notes"
                    rows={3}
                    placeholder="Any additional details or links..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="mt-3 text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !selectedDate || !selectedTime}
                className="btn-glass-primary mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
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
                    Booking...
                  </span>
                ) : (
                  "Book Appointment"
                )}
              </button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}
