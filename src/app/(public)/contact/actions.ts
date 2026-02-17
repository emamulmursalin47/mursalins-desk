"use server";

import type {
  ContactFormData,
  QuoteFormData,
  FormSubmissionResult,
} from "@/types/forms";

const API_URL = process.env.API_URL || "http://localhost:4000/api/v1";

export async function submitContact(
  data: ContactFormData,
): Promise<FormSubmissionResult> {
  if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
    return { success: false, message: "Please fill in all required fields." };
  }

  try {
    const res = await fetch(`${API_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        message: err.message || `Request failed (${res.status})`,
        errors: err.errors,
      };
    }

    return { success: true, message: "Message sent successfully!" };
  } catch {
    return { success: false, message: "Network error. Please try again." };
  }
}

export async function submitQuote(
  data: QuoteFormData,
): Promise<FormSubmissionResult> {
  if (
    !data.name?.trim() ||
    !data.email?.trim() ||
    !data.serviceType?.trim() ||
    !data.description?.trim()
  ) {
    return { success: false, message: "Please fill in all required fields." };
  }

  try {
    const res = await fetch(`${API_URL}/contact/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        message: err.message || `Request failed (${res.status})`,
        errors: err.errors,
      };
    }

    return { success: true, message: "Quote request sent successfully!" };
  } catch {
    return { success: false, message: "Network error. Please try again." };
  }
}
