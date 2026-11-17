"use client";

import { type FormEvent, useState } from "react";
import { studioConfig } from "@/config/studio.config";
import { validateEnquiry } from "@/lib/validation";

type ApiResult = {
  error?: string;
  fields?: Record<string, string>;
  enquiry?: { id: string };
};

export function EnquiryForm() {
  const { enquiry } = studioConfig.contact;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setErrors({});
    setFeedback("");
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      mobile: String(formData.get("mobile") ?? ""),
      message: String(formData.get("message") ?? ""),
    };
    const validation = validateEnquiry(payload);

    if (!validation.success) {
      setErrors(validation.errors);
      setFeedback(enquiry.validationError);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResult;
      if (!response.ok) {
        setErrors(result.fields ?? {});
        setFeedback(
          result.error ??
            Object.values(result.fields ?? {})[0] ??
            enquiry.requestError,
        );
        return;
      }

      setErrors({});
      setSubmitted(true);
    } catch {
      setFeedback(enquiry.networkError);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section
        aria-labelledby="enquiry-success-title"
        className="rounded-3xl border border-[var(--color-line)] bg-white p-7 sm:p-9"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">
          {enquiry.successEyebrow}
        </p>
        <h3
          id="enquiry-success-title"
          className="mt-3 font-serif text-3xl text-[var(--color-ink)]"
        >
          {enquiry.successTitle}
        </h3>
        <p role="status" className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
          {enquiry.successMessage}
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFeedback("");
            setErrors({});
          }}
          className="mt-7 min-h-11 rounded-full border border-[var(--color-line)] px-5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-clay)] hover:text-[var(--color-clay)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-clay)]"
        >
          {enquiry.anotherMessageLabel}
        </button>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-3xl border border-[var(--color-line)] bg-white p-6 sm:p-9"
    >
      <p className="text-sm leading-6 text-[var(--color-muted)]">
        {enquiry.contactHint}
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
            {enquiry.fieldLabels.name}
          </span>
          <input
            id="enquiry-name"
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "enquiry-name-error" : undefined}
            className={inputClass}
          />
          {errors.name ? (
            <FieldError id="enquiry-name-error" message={errors.name} />
          ) : null}
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
            {enquiry.fieldLabels.email}
          </span>
          <input
            id="enquiry-email"
            name="email"
            type="email"
            maxLength={254}
            autoComplete="email"
            aria-invalid={Boolean(errors.email || errors.contact)}
            aria-describedby={
              errors.email
                ? "enquiry-email-error"
                : errors.contact
                  ? "enquiry-contact-error"
                  : undefined
            }
            className={inputClass}
          />
          {errors.email ? (
            <FieldError id="enquiry-email-error" message={errors.email} />
          ) : null}
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
            {enquiry.fieldLabels.mobile}
          </span>
          <input
            id="enquiry-mobile"
            name="mobile"
            type="tel"
            maxLength={32}
            autoComplete="tel"
            aria-invalid={Boolean(errors.mobile || errors.contact)}
            aria-describedby={
              errors.mobile
                ? "enquiry-mobile-error"
                : errors.contact
                  ? "enquiry-contact-error"
                  : undefined
            }
            className={inputClass}
          />
          {errors.mobile ? (
            <FieldError id="enquiry-mobile-error" message={errors.mobile} />
          ) : null}
        </label>
        {errors.contact ? (
          <div className="sm:col-span-2">
            <FieldError id="enquiry-contact-error" message={errors.contact} />
          </div>
        ) : null}
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
            {enquiry.fieldLabels.message}
          </span>
          <textarea
            id="enquiry-message"
            name="message"
            rows={5}
            required
            maxLength={4000}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={
              errors.message ? "enquiry-message-error" : undefined
            }
            className={`${inputClass} py-3`}
          />
          {errors.message ? (
            <FieldError id="enquiry-message-error" message={errors.message} />
          ) : null}
        </label>
      </div>
      {feedback ? (
        <p
          role="alert"
          className="rounded-xl bg-[var(--color-sand)] px-4 py-3 text-sm text-[var(--color-ink)]"
        >
          {feedback}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="min-h-12 rounded-full bg-[var(--color-ink)] px-7 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-clay)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? enquiry.sendingLabel : enquiry.sendButtonLabel}
      </button>
    </form>
  );
}

const inputClass =
  "min-h-12 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] px-4 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-clay)] focus:ring-2 focus:ring-[var(--color-clay)]/20";

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <span id={id} className="mt-2 block text-xs text-red-700">
      {message}
    </span>
  );
}
