import type { Metadata } from "next";
import { getServices, getSettings } from "@/lib/api";
import { ContactHero } from "@/components/contact/contact-hero";
import { ClientJourney } from "@/components/contact/client-journey";
import { ContactTabs } from "@/components/contact/contact-tabs";

export const metadata: Metadata = {
  title: "Contact | Mursalin's Desk",
  description:
    "Get in touch — let's discuss your next project or book a free consultation call.",
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
      <ContactTabs services={services} settings={settings} />
    </>
  );
}
