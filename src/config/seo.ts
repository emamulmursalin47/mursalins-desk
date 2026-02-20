import type { Metadata } from "next";

export const siteConfig = {
  name: "Mursalin's Desk",
  description:
    "Md. Emamul Mursalin — freelance full-stack web developer from Bangladesh offering professional web development services. Hire an expert React, Next.js & Node.js developer for SaaS platforms, e-commerce solutions, and custom web applications.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mursalinsdesk.com",
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://mursalinsdesk.com"}/opengraph-image`,
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
    // Brand
    "Md. Emamul Mursalin",
    "Mursalin's Desk",
    // Primary target keywords
    "freelance web developer",
    "full stack developer",
    "freelance developer Bangladesh",
    "best web development service",
    "hire web developer",
    "freelance web developer Bangladesh",
    // Role variations
    "software engineer",
    "full-stack developer",
    "frontend developer",
    "backend developer",
    "React developer",
    "Next.js developer",
    "Node.js developer",
    // Service keywords
    "web development services",
    "custom web application development",
    "website development service",
    "professional web development",
    "affordable web development",
    "web development company Bangladesh",
    "web development agency",
    // Niche services
    "SaaS development",
    "e-commerce developer",
    "ecommerce website developer",
    "web app development",
    "responsive web design",
    "mobile-friendly web development",
    // Hire intent keywords
    "hire freelance developer",
    "hire full stack developer",
    "hire React developer",
    "hire software engineer",
    "freelance software engineer",
    "web developer for hire",
    "SaaS developer for hire",
    // Geo-targeted
    "top web developer Bangladesh",
    "best freelancer Bangladesh",
    "Bangladeshi web developer",
    "remote web developer",
    // Business intent
    "startup web developer",
    "small business web development",
    "business website developer",
    "custom software development",
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
