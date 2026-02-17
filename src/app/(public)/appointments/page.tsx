export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getSettings } from "@/lib/api";
import { AppointmentHero } from "@/components/appointments/appointment-hero";
import { BookingForm } from "@/components/appointments/booking-form";

export const metadata: Metadata = {
  title: "Book a Call | Mursalin's Desk",
  description:
    "Schedule a free consultation call to discuss your project goals and timeline.",
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
