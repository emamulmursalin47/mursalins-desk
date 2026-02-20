import type { Metadata } from "next";
import { getSettings } from "@/lib/api";
import { AppointmentHero } from "@/components/appointments/appointment-hero";
import { BookingForm } from "@/components/appointments/booking-form";

export const metadata: Metadata = {
  title: "Book a Free Call — Hire a Freelance Web Developer",
  description:
    "Schedule a free consultation with Md. Emamul Mursalin — freelance full-stack web developer from Bangladesh. Discuss your web app, SaaS, or e-commerce project requirements and get a custom quote.",
};

export default async function AppointmentsPage() {
  const settings = await getSettings().catch(() => []);

  return (
    <>
      <AppointmentHero settings={settings} />
      <BookingForm />
    </>
  );
}
