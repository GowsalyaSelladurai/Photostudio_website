import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FloatingContact } from "@/components/layout/floating-contact";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { studioConfig } from "@/config/studio.config";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${studioConfig.name} — ${studioConfig.tagline}`,
    template: `%s | ${studioConfig.name}`,
  },
  description: studioConfig.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <SiteHeader />
        <main id="main-content" className="flex-1">{children}</main>
        <SiteFooter />
        <FloatingContact />
      </body>
    </html>
  );
}
