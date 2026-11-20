import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
      <SectionHeading eyebrow="Demo terms draft" title="Terms of use" description="This sample copy is not legal advice and must be replaced with studio-approved terms before launch." />
      <div className="mt-10 space-y-6 text-sm leading-7 text-[var(--color-muted)]">
        <section><h2 className="font-semibold text-[var(--color-ink)]">Demonstration website</h2><p className="mt-2">StudioFrame and the prices, offers, contact details, reviews, and service descriptions on this website are sample content only and are not an offer to provide photography services.</p></section>
        <section><h2 className="font-semibold text-[var(--color-ink)]">Bookings and pricing</h2><p className="mt-2">The demo booking form acknowledges receipt only. No session is confirmed and no displayed amount is a client-approved price. Production booking, cancellation, payment, and pricing terms must be supplied by the studio.</p></section>
        <section><h2 className="font-semibold text-[var(--color-ink)]">Contact</h2><p className="mt-2">Replace this draft with studio-approved terms, governing jurisdiction, and contact information before public launch.</p></section>
      </div>
    </article>
  );
}
