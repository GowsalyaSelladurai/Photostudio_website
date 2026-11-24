"use client";

import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import {
  filmShootTypes,
  photographyShootTypes,
  validateBooking,
} from "@/lib/validation";

type ApiResult = {
  error?: string;
  fields?: Record<string, string>;
  booking?: { reference?: string; startsAt?: string };
};

type BookingConfirmation = {
  reference: string;
  startsAt: string;
};

export function BookingForm() {
  const searchParams = useSearchParams();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] =
    useState<BookingConfirmation | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setErrors({});
    setMessage("");
    setSubmitting(true);

    const formData = new FormData(form);
    const localDateTime = String(formData.get("dateTime") ?? "");
    const parsedDateTime = new Date(localDateTime);
    if (!localDateTime || !Number.isFinite(parsedDateTime.getTime())) {
      setErrors({ dateTime: "Choose a valid date and time." });
      setMessage("Please correct the highlighted fields.");
      setSubmitting(false);
      return;
    }

    const payload = {
      name: String(formData.get("name") ?? ""),
      mobile: String(formData.get("mobile") ?? ""),
      shootType: String(formData.get("shootType") ?? ""),
      dateTime: parsedDateTime.toISOString(),
      location: String(formData.get("location") ?? ""),
      requirements: String(formData.get("requirements") ?? ""),
    };
    const validation = validateBooking(payload);
    if (!validation.success) {
      setErrors(validation.errors);
      setMessage("Please correct the highlighted fields.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResult;
      if (!response.ok) {
        setErrors(result.fields ?? {});
        setMessage(result.error ?? "We could not submit your request.");
        return;
      }

      if (!result.booking?.reference || !result.booking.startsAt) {
        setMessage(
          "We could not verify your booking receipt. Please try again later.",
        );
        return;
      }

      setConfirmation({
        reference: result.booking.reference,
        startsAt: result.booking.startsAt,
      });
      form.reset();
    } catch {
      setMessage(
        "The booking service could not be reached. Please try again later.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <section
        aria-labelledby="booking-confirmation-title"
        aria-live="polite"
        className="rounded-3xl border border-[var(--color-line)] bg-white p-6 sm:p-9"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-clay)]">
          Request received
        </p>
        <h2
          id="booking-confirmation-title"
          className="mt-3 font-serif text-3xl text-[var(--color-ink)] sm:text-4xl"
        >
          Thank you for getting in touch.
        </h2>
        <p className="mt-4 leading-7 text-[var(--color-muted)]">
          Your booking request has been saved. This is not a confirmed
          appointment; the studio will follow up to confirm availability.
        </p>
        <div className="mt-7 rounded-2xl bg-[var(--color-sand)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
            Your booking reference
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[var(--color-ink)]">
            {confirmation.reference}
          </p>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Requested for{" "}
            {new Date(confirmation.startsAt).toLocaleString(undefined, {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmation(null)}
          className="mt-7 min-h-12 rounded-full border border-[var(--color-line)] px-6 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-clay)]"
        >
          Send another request
        </button>
      </section>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-[var(--color-line)] bg-white p-6 sm:p-9"
    >
      <p className="rounded-xl bg-[var(--color-sand)] px-4 py-3 text-sm leading-6 text-[var(--color-muted)]">
        Demo form: date and time are interpreted in your device&apos;s local
        timezone. The studio timezone and booking policies need client approval.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Customer name"
          name="name"
          required
          error={errors.name}
          autoComplete="name"
        />
        <Field
          label="Mobile number"
          name="mobile"
          type="tel"
          required
          error={errors.mobile}
          autoComplete="tel"
        />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
            Shoot type
          </span>
          <select
            id="shootType"
            name="shootType"
            required
            defaultValue={searchParams.get("shootType") ?? ""}
            aria-invalid={Boolean(errors.shootType)}
            aria-describedby={errors.shootType ? "shootType-error" : undefined}
            className={inputClass}
          >
            <option value="" disabled>
              Choose a session
            </option>
            <optgroup label="Photography">
              {photographyShootTypes.map((shootType) => (
                <option key={shootType} value={shootType}>
                  {shootType}
                </option>
              ))}
            </optgroup>
            <optgroup label="Film & Video">
              {filmShootTypes.map((shootType) => (
                <option key={shootType} value={shootType}>
                  {shootType}
                </option>
              ))}
            </optgroup>
          </select>
          {errors.shootType ? (
            <FieldError id="shootType-error" message={errors.shootType} />
          ) : null}
        </label>
        <Field
          label="Preferred date and time"
          name="dateTime"
          type="datetime-local"
          required
          error={errors.dateTime}
        />
        <Field
          label="Location"
          name="location"
          required
          error={errors.location}
        />
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
            Additional requirements (optional)
          </span>
          <textarea
            id="requirements"
            name="requirements"
            rows={4}
            maxLength={2000}
            aria-invalid={Boolean(errors.requirements)}
            aria-describedby={
              errors.requirements ? "requirements-error" : undefined
            }
            className={`${inputClass} py-3`}
            placeholder="Tell us what you have in mind."
          />
          {errors.requirements ? (
            <FieldError
              id="requirements-error"
              message={errors.requirements}
            />
          ) : null}
        </label>
      </div>
      {message ? (
        <p
          role={Object.keys(errors).length > 0 ? "alert" : "status"}
          className="rounded-xl bg-[var(--color-sand)] px-4 py-3 text-sm text-[var(--color-ink)]"
        >
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="min-h-12 rounded-full bg-[var(--color-ink)] px-7 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-clay)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send booking request"}
      </button>
    </form>
  );
}

const inputClass =
  "min-h-12 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] px-4 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-clay)] focus:ring-2 focus:ring-[var(--color-clay)]/20";

function Field({
  label,
  name,
  type = "text",
  required = false,
  error,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  autoComplete?: string;
}) {
  const errorId = `${name}-error`;
  const maxLength =
    name === "name"
      ? 120
      : name === "mobile"
        ? 32
        : name === "location"
          ? 300
          : undefined;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
        {label}
      </span>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={inputClass}
      />
      {error ? <FieldError id={errorId} message={error} /> : null}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <span id={id} className="mt-2 block text-xs text-red-700">
      {message}
    </span>
  );
}