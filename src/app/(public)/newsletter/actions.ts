"use server";

import type { FormSubmissionResult } from "@/types/forms";

const API_URL = process.env.API_URL || "http://localhost:4000/api/v1";

export async function subscribeNewsletter(
  email: string,
): Promise<FormSubmissionResult> {
  if (!email?.trim()) {
    return { success: false, message: "Please enter your email address." };
  }

  try {
    const res = await fetch(`${API_URL}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 409) {
        return { success: false, message: "You're already subscribed!" };
      }
      return {
        success: false,
        message: err.message || `Request failed (${res.status})`,
      };
    }

    return { success: true, message: "You're subscribed! Welcome aboard." };
  } catch {
    return { success: false, message: "Network error. Please try again." };
  }
}
