
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
    <main className="min-h-screen w-full overflow-x-clip bg-[var(--color-sand)] px-4 pb-8 pt-12 text-[var(--color-ink)] antialiased sm:px-6 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8 lg:px-8 lg:pt-16">

      {/* Left: Editorial Image */}
      <aside className="relative isolate h-[55vh] min-h-[380px] w-full overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-ink)] shadow-[0_15px_45px_rgba(30,25,20,0.10)] sm:h-[60vh] lg:sticky lg:top-16 lg:h-[calc(100vh-5rem)] lg:min-h-[500px]">

        <img
          src="/images/enquiry-editorial.jpeg"
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
      <div className="min-w-0 w-full px-1 py-10 sm:px-4 sm:py-12 lg:px-4 lg:py-2">
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