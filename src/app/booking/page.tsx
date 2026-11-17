import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/forms/booking-form";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "Booking" };

export default function BookingPage() {
  return (
    <section className="bg-[var(--color-sand)] px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="lg:sticky lg:top-36">
          <SectionHeading eyebrow="Start a conversation" title="Tell us what you are celebrating." description="Share a few details and this demo form will submit a booking request." />
          <p className="mt-6 text-sm leading-6 text-[var(--color-muted)]">A successful submission confirms receipt only. Session availability, approval, and booking policies require studio confirmation.</p>
        </div>
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white" />}>
          <BookingForm />
        </Suspense>
      </div>
    </section>
  );
}
