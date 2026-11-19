import type { Metadata } from "next";
import { PricingConfigurator } from "@/components/pricing/pricing-configurator";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "Frames" };

export default function FramesPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="mb-10">
        <SectionHeading eyebrow="Made to live with" title="A frame for your favorite moment." description="Choose a size, material, and finishing touch to see a live demo estimate." />
        <p className="mt-4 text-xs text-[var(--color-muted)]">All options and USD prices are illustrative demo data, not a client-approved catalogue.</p>
      </div>
      <PricingConfigurator kind="frame" />
    </section>
  );
}
