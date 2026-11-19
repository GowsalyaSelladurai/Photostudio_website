
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
    <main className="min-h-screen w-full overflow-x-clip bg-[var(--color-sand)] text-[var(--color-ink)] antialiased lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">

      {/* Left: Editorial Image */}
      <aside className="relative isolate h-[60vh] min-h-[420px] w-full overflow-hidden bg-[var(--color-ink)] sm:h-[65vh] lg:sticky lg:top-0 lg:h-screen lg:min-h-0">
        <img
          src="/images/enquiry-editorial.png"
          alt="Photography studio camera and creative details"
          className="contact-image-animate absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        <div className="contact-text-animate relative z-10 flex h-full flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14">
          <p className="w-fit rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs tracking-wide text-white backdrop-blur-md">
            {contact.introduction.eyebrow}
          </p>

          <div className="max-w-xl">
            <h1 className="font-serif text-4xl leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Every story starts with a hello.
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/80 sm:text-base">
              {contact.introduction.description}
            </p>
          </div>
        </div>
      </aside>

      {/* Right: Form and Contact Details */}
      <div className="min-w-0 w-full px-5 py-12 sm:px-10 sm:py-16 lg:px-10 lg:py-14 xl:px-16">
        <div className="mx-auto w-full max-w-xl">

          {/* Enquiry Form */}
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

          {/* Direct Contact */}
          <section className="mt-14">
            <h2 className="font-serif text-3xl tracking-tight">
              Prefer to reach out directly?
            </h2>

            <div className="mt-5 rounded-2xl bg-[var(--color-ink)] p-6 text-sm leading-7 text-white/75 sm:p-8">
              <StudioContactPanel />
            </div>
          </section>

          {/* Studio Location */}
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
