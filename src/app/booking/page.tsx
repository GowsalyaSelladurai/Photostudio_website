
import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/forms/booking-form";
import { BookingLookup } from "@/components/forms/booking-lookup";

export const metadata: Metadata = {
  title: "Booking",
};

export default function BookingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-sand)] pt-5 sm:pt-7">

      {/* Editorial Booking Banner */}
      <section className="relative mx-4 h-[210px] overflow-hidden rounded-2xl shadow-[0_15px_45px_rgba(30,25,20,0.12)] sm:mx-8 sm:h-[250px] lg:mx-12 lg:h-[290px]">

        <img
          src="/images/booking-banner.PNG"
          alt="Photography studio aesthetic"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Subtle Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

        {/* Banner Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">

          <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-white/80 sm:text-[10px]">
            Photography Studio
          </p>

          <div className="my-4 h-px w-12 bg-white/60" />

          <h1 className="font-serif text-3xl leading-tight text-white sm:text-5xl lg:text-6xl">
            Let's create something
            <br className="sm:hidden" />
            <span className="italic text-white/85">
              {" "}beautiful.
            </span>
          </h1>

          <p className="mt-4 text-[10px] tracking-[0.2em] text-white/80 sm:text-xs">
            YOUR MOMENTS, OUR PASSION
          </p>

        </div>
      </section>

      {/* Booking Page Content */}
      <div className="px-4 py-10 sm:px-8 sm:py-14">

        <div className="mx-auto max-w-7xl">

          {/* Top Heading */}
          <div className="mb-10 flex flex-col justify-between gap-5 border-b border-[var(--color-line)] pb-7 sm:flex-row sm:items-end">

            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--color-clay)]" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--color-clay)]">
                  Studio / Booking
                </p>
              </div>

              <h2 className="mt-4 font-serif text-4xl leading-tight text-[var(--color-ink)] sm:text-5xl lg:text-6xl">
                Let's make it{" "}
                <span className="italic text-[var(--color-clay)]">
                  timeless.
                </span>
              </h2>
            </div>

            <p className="max-w-xs text-sm leading-7 text-[var(--color-muted)]">
              A little conversation is all it takes to begin capturing
              something beautiful.
            </p>
          </div>

          {/* Booking Lookup */}
          <BookingLookup />

          {/* Main Booking Card */}
          <div className="grid overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] shadow-[0_18px_55px_rgba(0,0,0,0.05)] lg:grid-cols-2">

            {/* Left Image Panel */}
            <div className="relative min-h-[430px] overflow-hidden bg-[var(--color-ink)] sm:min-h-[540px] lg:min-h-[760px]">

              <img
                src="/images/booking-editorial.png"
                alt="Photography moments captured by our studio"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
              />

              {/* Soft Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/15" />

              {/* Top Image Details */}
              <div className="absolute left-6 right-6 top-7 flex items-center justify-between sm:left-9 sm:right-9 sm:top-9">

                <div className="rounded-full border border-white/30 bg-black/10 px-4 py-2 backdrop-blur-sm">
                  <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-white">
                    Photography Studio
                  </span>
                </div>

                <span className="font-serif text-sm italic text-white/90">
                  Est. With love
                </span>
              </div>

              {/* Image Content */}
              <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-10 lg:p-12">

                <p className="mb-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-white/80">
                  <span className="h-px w-8 bg-white/70" />
                  Every frame tells a story
                </p>

                <h2 className="max-w-lg font-serif text-5xl leading-[1.08] text-white sm:text-6xl lg:text-7xl">
                  Moments fade.
                  <br />
                  Memories
                  <br />
                  <span className="italic text-white/85">
                    stay forever.
                  </span>
                </h2>

                <div className="my-7 h-px w-16 bg-white/60" />

                <p className="max-w-sm text-sm leading-7 text-white/85">
                  From the little details to the biggest celebrations,
                  let's preserve the moments that matter most.
                </p>

                <div className="mt-9 flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  <span className="text-[9px] uppercase tracking-[0.25em] text-white/70">
                    Creating memories, one frame at a time
                  </span>
                </div>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12 xl:p-14">

              <div className="mb-8">

                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-clay)]" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-clay)]">
                    Your next chapter
                  </p>
                </div>

                <h2 className="mt-5 font-serif text-4xl leading-[1.12] text-[var(--color-ink)] sm:text-5xl">
                  Begin your
                  <br />
                  <span className="italic text-[var(--color-clay)]">
                    booking.
                  </span>
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-[var(--color-muted)]">
                  Tell us a little about your plans. We'll connect with you
                  to discuss your photography session.
                </p>
              </div>

              {/* Form Divider */}
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px flex-1 bg-[var(--color-line)]" />
                <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-[var(--color-muted)]">
                  Booking enquiry
                </span>
                <span className="h-px flex-1 bg-[var(--color-line)]" />
              </div>

              {/* Existing Booking Form */}
              <Suspense
                fallback={
                  <div className="h-96 animate-pulse rounded-xl bg-[var(--color-sand)]" />
                }
              >
                <BookingForm />
              </Suspense>

              <div className="mt-8 border-t border-[var(--color-line)] pt-6 text-center">
                <p className="font-serif text-lg italic text-[var(--color-muted)]">
                  Your story deserves to be remembered.
                </p>

                <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-[var(--color-clay)]">
                  Let's capture it beautifully
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Information */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <span className="font-serif text-2xl italic text-[var(--color-clay)]">
                01.
              </span>

              <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
                Send your enquiry
              </p>

              <p className="mt-2 text-xs leading-6 text-[var(--color-muted)]">
                Share your session details and photography requirements.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <span className="font-serif text-2xl italic text-[var(--color-clay)]">
                02.
              </span>

              <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
                Discuss your session
              </p>

              <p className="mt-2 text-xs leading-6 text-[var(--color-muted)]">
                Our studio will connect with you to discuss availability.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <span className="font-serif text-2xl italic text-[var(--color-clay)]">
                03.
              </span>

              <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
                Confirm your booking
              </p>

              <p className="mt-2 text-xs leading-6 text-[var(--color-muted)]">
                Your session is confirmed after studio approval.
              </p>
            </div>

          </div>

          {/* Footer */}
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[var(--color-line)] pt-6 sm:flex-row">

            <p className="font-serif text-lg italic text-[var(--color-ink)]">
              Moments worth keeping.
            </p>

            <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
              Photography · Stories · Memories
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}