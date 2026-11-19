
"use client";

import { useState, type FormEvent } from "react";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

type LookupResult = {
  reference: string;
  shootType: string;
  startsAt: string;
  status: BookingStatus;
};

type ApiResult = {
  error?: string;
  booking?: LookupResult;
};

const statusDetails: Record<
  BookingStatus,
  { label: string; description: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    description:
      "Your request has been received. Our studio will contact you to confirm availability.",
    className: "bg-amber-50 text-amber-800 border border-amber-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    description:
      "Your booking has been confirmed. We look forward to your session!",
    className: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  },
  CANCELLED: {
    label: "Cancelled",
    description:
      "This booking has been cancelled. Please contact our studio if you need assistance.",
    className: "bg-red-50 text-red-800 border border-red-200",
  },
};

export function BookingLookup() {
  const [reference, setReference] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [booking, setBooking] = useState<LookupResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setBooking(null);
    setLoading(true);

    try {
      const response = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference: reference.trim(),
          mobile: mobile.trim(),
        }),
      });

      const result = (await response.json()) as ApiResult;

      if (!response.ok || !result.booking) {
        setMessage(result.error ?? "Unable to find your booking.");
        return;
      }

      setBooking(result.booking);
    } catch {
      setMessage(
        "The booking service could not be reached. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  }

  function resetLookup() {
    setBooking(null);
    setMessage("");
    setReference("");
    setMobile("");
  }

  return (
    <section className="mb-10">
      {!booking ? (
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[#eee9e1] px-5 py-7 shadow-[0_12px_35px_rgba(40,30,20,0.07)] sm:px-8 sm:py-9 lg:px-10">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-[var(--color-clay)]/15" />
          <div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full border border-[var(--color-clay)]/15" />

          <form
            onSubmit={handleSubmit}
            className="relative z-10 grid min-w-0 grid-cols-1 items-end gap-6 lg:grid-cols-[minmax(210px,0.9fr)_minmax(0,1.7fr)_auto] lg:gap-8"
          >
            {/* Heading */}
            <div className="min-w-0">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-px w-7 bg-[var(--color-clay)]" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--color-clay)]">
                  Your booking
                </p>
              </div>

              <h2 className="font-serif text-3xl leading-tight text-[var(--color-ink)] sm:text-[2.1rem]">
                Check your
                <span className="block italic text-[var(--color-clay)]">
                  booking.
                </span>
              </h2>

              <p className="mt-3 max-w-xs text-xs leading-6 text-[var(--color-muted)]">
                Already booked with us? Find your session details and booking status here.
              </p>
            </div>

            {/* Input Fields */}
            <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <div className="min-w-0">
                <label
                  htmlFor="booking-reference"
                  className="mb-2 block text-xs font-semibold text-[var(--color-ink)]"
                >
                  Booking reference
                </label>

                <input
                  id="booking-reference"
                  type="text"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="e.g. SF-000001"
                  required
                  maxLength={30}
                  autoComplete="off"
                  className="min-h-12 w-full min-w-0 rounded-lg border border-[var(--color-line)] bg-white/75 px-4 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-clay)] focus:ring-2 focus:ring-[var(--color-clay)]/10 placeholder:text-[var(--color-muted)]"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="booking-mobile"
                  className="mb-2 block text-xs font-semibold text-[var(--color-ink)]"
                >
                  Registered mobile
                </label>

                <input
                  id="booking-mobile"
                  type="tel"
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  placeholder="Enter mobile number"
                  required
                  maxLength={32}
                  autoComplete="tel"
                  className="min-h-12 w-full min-w-0 rounded-lg border border-[var(--color-line)] bg-white/75 px-4 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-clay)] focus:ring-2 focus:ring-[var(--color-clay)]/10 placeholder:text-[var(--color-muted)]"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="min-h-12 w-full whitespace-nowrap rounded-lg bg-[var(--color-ink)] px-7 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:bg-[var(--color-clay)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
            >
              {loading ? "Checking..." : "Check status →"}
            </button>

            {/* Error */}
            {message && (
              <p
                role="alert"
                className="text-sm text-red-600 lg:col-span-3"
              >
                {message}
              </p>
            )}
          </form>
        </div>
      ) : (
        <div
          aria-live="polite"
          className="rounded-2xl border border-[var(--color-line)] bg-[#eee9e1] p-6 shadow-[0_12px_35px_rgba(40,30,20,0.07)] sm:p-9"
        >
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--color-clay)]">
                Booking details
              </p>

              <h2 className="font-serif text-3xl text-[var(--color-ink)]">
                {booking.reference}
              </h2>

              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {booking.shootType} ·{" "}
                {new Date(booking.startsAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold ${statusDetails[booking.status].className}`}
              >
                {statusDetails[booking.status].label}
              </span>

              <button
                type="button"
                onClick={resetLookup}
                className="text-xs font-semibold text-[var(--color-clay)] underline underline-offset-4"
              >
                Check another
              </button>
            </div>
          </div>

          <p className="mt-6 border-t border-[var(--color-line)] pt-5 text-sm leading-6 text-[var(--color-muted)]">
            {statusDetails[booking.status].description}
          </p>
        </div>
      )}
    </section>
  );
}
