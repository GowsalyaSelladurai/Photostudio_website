import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
      <SectionHeading eyebrow="Demo policy draft" title="Privacy policy" description="This sample copy is not legal advice and must be replaced with studio-approved terms before launch." />
      <div className="mt-10 space-y-6 text-sm leading-7 text-[var(--color-muted)]">
        <section><h2 className="font-semibold text-[var(--color-ink)]">Information submitted</h2><p className="mt-2">This demo may collect the details entered in booking and enquiry forms. No production retention period, lawful basis, or contact process has been configured.</p></section>
        <section><h2 className="font-semibold text-[var(--color-ink)]">How information may be used</h2><p className="mt-2">In a real studio website, submitted information would be used to respond to requests. The studio owner must confirm the purpose, providers, retention, and deletion process before launch.</p></section>
        <section><h2 className="font-semibold text-[var(--color-ink)]">Questions</h2><p className="mt-2">Replace this section with the studio&apos;s approved contact and jurisdiction-specific privacy information.</p></section>
      </div>
    </article>
  );
}
