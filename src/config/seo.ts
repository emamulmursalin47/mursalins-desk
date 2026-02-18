import type { Metadata } from "next";

export const siteConfig = {
  name: "Mursalin's Desk",
  description:
    "Portfolio of Md. Emamul Mursalin — software engineer from Bangladesh specializing in full-stack web development, SaaS platforms, and e-commerce solutions. Explore projects, services, and digital products.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mursalinsdesk.com",
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://mursalinsdesk.com"}/logo.png`,
  links: {
    github: "https://github.com/emamulmursalin47",
    linkedin: "https://www.linkedin.com/in/mdemamulmursalin/",
    facebook: "https://www.facebook.com/profile.php?id=61584072675374",
    whatsapp: "https://wa.me/8801738753102",
  },
  creator: {
    name: "Md. Emamul Mursalin",
    twitter: "@mursalinsdesk",
  },
  keywords: [
    "Md. Emamul Mursalin",
    "Mursalin's Desk",
    "Software Engineer",
    "Full-Stack Developer",
    "Web Developer Bangladesh",
    "Hire Software Engineer",
    "Web Development Services",
    "SaaS Development",
    "E-Commerce Developer",
    "Portfolio",
    "Next.js Developer",
    "React Developer",
  ],
} as const;

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [
    {
      name: siteConfig.creator.name,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.creator.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.creator.twitter,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
};
