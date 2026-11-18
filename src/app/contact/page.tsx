import type { Metadata } from "next";
import {
  GoogleMapsPlaceholder,
  StudioContactPanel,
} from "@/components/contact/studio-contact-panel";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { studioConfig } from "@/config/studio.config";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  const { contact } = studioConfig;

  return (
    <main className="min-h-screen bg-[var(--color-sand)] text-[var(--color-ink)] antialiased lg:grid lg:grid-cols-[1fr_1.1fr]">
      {/* Left: full-height image that stays in view while the right side scrolls */}
      <aside className="relative min-h-[60vh] overflow-hidden bg-[var(--color-ink)] lg:sticky lg:top-0 lg:h-screen">
        <img
          src="/images/enquiry-editorial.png"
          alt="Photography studio camera and creative details"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        <div className="relative flex h-full flex-col justify-between p-7 sm:p-10">
          <p className="w-fit rounded-full bg-white/15 px-4 py-1.5 text-sm text-white backdrop-blur">
            {contact.introduction.eyebrow}
          </p>

          <div>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl xl:text-7xl">
              Every story starts with a hello.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-white/80">
              {contact.introduction.description}
            </p>
          </div>
        </div>
      </aside>

      {/* Right: form, contact details, map */}
      <div className="px-5 py-12 sm:px-10 sm:py-16 lg:px-14 xl:px-20">
        <div className="mx-auto max-w-xl">
          <section>
            <p className="text-sm font-medium text-[var(--color-clay)]">
              {contact.enquiry.eyebrow}
            </p>
            <h2 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
              Tell us about your shoot
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--color-muted)]">
              {contact.enquiry.description}
            </p>

            <div className="mt-8 rounded-2xl bg-[var(--color-paper)] p-5 shadow-sm ring-1 ring-[var(--color-line)] sm:p-8">
              <EnquiryForm />
            </div>
          </section>

          <section className="mt-14">
            <h2 className="font-serif text-3xl tracking-tight">
              Prefer to reach out directly?
            </h2>
            <div className="mt-5 rounded-2xl bg-[var(--color-ink)] p-6 text-sm leading-7 text-white/75 sm:p-8">
              <StudioContactPanel />
            </div>
          </section>

          <section className="mt-14">
            <h2 className="font-serif text-3xl tracking-tight">
              Visit the studio
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              Come say hello in person. We'd be delighted to meet you.
            </p>
            <div className="mt-5 overflow-hidden rounded-2xl bg-[var(--color-paper)] p-2 ring-1 ring-[var(--color-line)]">
              <div className="overflow-hidden rounded-xl">
                <GoogleMapsPlaceholder />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}