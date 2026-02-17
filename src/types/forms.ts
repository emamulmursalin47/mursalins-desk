import type { AppointmentType } from "./api";

/* ── Contact Form ── */

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  subject?: string;
  budget?: string;
  timeline?: string;
  source?: string;
}

/* ── Quote Request ── */

export interface QuoteFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  serviceType: string;
  description: string;
  budget?: string;
  timeline?: string;
}

/* ── Appointment Booking ── */

export interface BookingFormData {
  name: string;
  email: string;
  phone?: string;
  date: string; // ISO date string
  duration?: number; // minutes, min 15
  topic?: string;
  notes?: string;
  timezone?: string;
  type?: AppointmentType;
}

/* ── Shared result shape ── */

export interface FormSubmissionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}
