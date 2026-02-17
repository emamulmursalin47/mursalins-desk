"use server";

import type { BookingFormData, FormSubmissionResult } from "@/types/forms";

const API_URL = process.env.API_URL || "http://localhost:4000/api/v1";

export async function bookAppointment(
  data: BookingFormData,
): Promise<FormSubmissionResult> {
  if (!data.name?.trim() || !data.email?.trim() || !data.date) {
    return { success: false, message: "Please fill in all required fields." };
  }

  // Ensure date is in the future
  if (new Date(data.date) <= new Date()) {
    return { success: false, message: "Please select a future date and time." };
  }

  try {
    const res = await fetch(`${API_URL}/appointments`, {
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

    return { success: true, message: "Appointment booked successfully!" };
  } catch {
    return { success: false, message: "Network error. Please try again." };
  }
}
