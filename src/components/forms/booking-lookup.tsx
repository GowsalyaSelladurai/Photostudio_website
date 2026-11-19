
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

const inputClass =
  "min-h-12 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] px-4 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-clay)] focus:ring-2 focus:ring-[var(--color-clay)]/20";

const statusDetails: Record<
  BookingStatus,
  { label: string; description: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    description:
      "Your request has been received. Our studio will contact you to confirm availability.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  CONFIRMED: {
    label: "Confirmed",
    description:
      "Your booking has been confirmed. We look forward to your session!",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  CANCELLED: {
    label: "Cancelled",
    description:
      "This booking has been cancelled. Please contact our studio if you need assistance.",
    className: "border-red-200 bg-red-50 text-red-800",
  },
};

export function BookingLookup() {
  const [isOpen, setIsOpen] = useState(false);
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
    <section className="mb-8">
      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-expanded={isOpen}
          aria-controls="booking-lookup-panel"
          className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[var(--color-paper)] sm:p-6"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-clay)]">
              Already made a booking?
            </p>

            <h2 className="mt-2 font-serif text-xl text-[var(--color-ink)] sm:text-2xl">
              Check your booking status
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              View your booking details and current request status.
            </p>
          </div>

          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] text-xl text-[var(--color-ink)]">
            {isOpen ? "−" : "+"}
          </span>
        </button>

        {isOpen && (
          <div
            id="booking-lookup-panel"
            className="border-t border-[var(--color-line)] bg-[var(--color-paper)] p-5 sm:p-7"
          >
            {!booking ? (
              <form
                onSubmit={handleSubmit}
                className="max-w-xl space-y-5"
              >
                <div>
                  <label
                    htmlFor="booking-reference"
                    className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
                  >
                    Booking reference number
                  </label>

                  <input
                    id="booking-reference"
                    type="text"
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    placeholder="Example: SF-000001"
                    required
                    maxLength={30}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-mobile"
                    className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
                  >
                    Registered mobile number
                  </label>

                  <input
                    id="booking-mobile"
                    type="tel"
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value)}
                    placeholder="Enter your registered mobile number"
                    required
                    maxLength={32}
                    className={inputClass}
                  />
                </div>

                {message && (
                  <p
                    role="alert"
                    className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-12 rounded-full bg-[var(--color-ink)] px-7 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-clay)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Checking..." : "Check booking"}
                </button>
              </form>
            ) : (
              <div className="max-w-xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    Booking details
                  </p>

                  <span
                    className={`rounded-full border px-4 py-2 text-xs font-semibold ${statusDetails[booking.status].className}`}
                  >
                    {statusDetails[booking.status].label}
                  </span>
                </div>

                <div className="mt-5 space-y-4 rounded-2xl border border-[var(--color-line)] bg-white p-5">
                  <div>
                    <p className="text-xs text-[var(--color-muted)]">
                      Booking reference
                    </p>
                    <p className="mt-1 font-mono text-xl font-semibold text-[var(--color-ink)]">
                      {booking.reference}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-[var(--color-muted)]">
                        Shoot type
                      </p>
                      <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">
                        {booking.shootType}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--color-muted)]">
                        Requested date
                      </p>
                      <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">
                        {new Date(booking.startsAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
                  {statusDetails[booking.status].description}
                </p>

                <button
                  type="button"
                  onClick={resetLookup}
                  className="mt-6 min-h-11 rounded-full border border-[var(--color-line)] px-6 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-clay)]"
                >
                  Check another booking
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}