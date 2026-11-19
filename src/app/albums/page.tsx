import type { Metadata } from "next";
import { PricingConfigurator } from "@/components/pricing/pricing-configurator";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "Albums" };

export default function AlbumsPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="mb-10">
        <SectionHeading eyebrow="A story to turn the pages of" title="Your memories, in a book of their own." description="Choose an album size, page count, and finish to see a live demo estimate." />
        <p className="mt-4 text-xs text-[var(--color-muted)]">All options and USD prices are illustrative demo data, not a client-approved catalogue.</p>
      </div>
      <PricingConfigurator kind="album" />
    </section>
  );
}
