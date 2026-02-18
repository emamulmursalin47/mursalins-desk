import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Playfair_Display } from "next/font/google";
import { defaultMetadata } from "@/config/seo";
import { WebsiteJsonLd, OrganizationJsonLd } from "@/components/seo/json-ld";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { WaterCanvas } from "@/components/layout/water-canvas";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const satoshi = localFont({
  src: [
    { path: "../fonts/Satoshi-Light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/Satoshi-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${playfair.variable}`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('has-js')",
          }}
        />
        <WebsiteJsonLd />
        <OrganizationJsonLd />
      </head>
      <body className="font-sans antialiased">
        <GoogleAnalytics />
        <div className="bg-orbs" aria-hidden="true">
          <div className="orb-lavender" />
          <div className="orb-gold" />
          <div className="orb-teal" />
        </div>
        {/* <WaterCanvas /> */}
        <AuthProvider>
          <div className="relative w-full overflow-x-clip">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
