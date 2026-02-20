import { Suspense } from "react";
import type { Metadata } from "next";
import { getServices, getSettings } from "@/lib/api";
import { ContactHero } from "@/components/contact/contact-hero";
import { ClientJourney } from "@/components/contact/client-journey";
import { ContactTabs } from "@/components/contact/contact-tabs";

export const metadata: Metadata = {
  title: "Contact — Hire a Freelance Web Developer",
  description:
    "Get in touch with Md. Emamul Mursalin — freelance full-stack web developer from Bangladesh. Discuss your project, get a free quote, or book a consultation call for web development services.",
};

export default async function ContactPage() {
  const [services, settings] = await Promise.all([
    getServices().catch(() => []),
    getSettings().catch(() => []),
  ]);

  return (
    <>
      <ContactHero settings={settings} />
      <ClientJourney />
      <Suspense>
        <ContactTabs services={services} settings={settings} />
      </Suspense>
    </>
  );
}
