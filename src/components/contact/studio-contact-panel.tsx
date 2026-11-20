
import { studioConfig } from "@/config/studio.config";

export function StudioContactPanel() {
  const { contact } = studioConfig;

  return (
    <div className="premium-card rounded-3xl p-6 sm:p-8">
      <dl className="grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
            {contact.detailsLabels.address}
          </dt>
          <dd className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
            <address className="not-italic">{contact.address}</address>
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
            {contact.detailsLabels.hours}
          </dt>
          <dd className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
            {contact.hours}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
            {contact.detailsLabels.email}
          </dt>
          <dd className="mt-2 text-sm text-[var(--color-ink)]">
            {contact.email.trim() ? (
              <a
                href={`mailto:${contact.email}`}
                className="underline decoration-[var(--color-line)] underline-offset-4 hover:text-[var(--studio-midnight-black)] hover:decoration-[var(--studio-champagne-gold)]"
              >
                {contact.email}
              </a>
            ) : (
              "Not provided"
            )}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
            {contact.detailsLabels.phone}
          </dt>
          <dd className="mt-2 text-sm text-[var(--color-ink)]">
            {contact.phoneHref.trim() ? (
              <a
                href={`tel:${contact.phoneHref}`}
                className="underline decoration-[var(--color-line)] underline-offset-4 hover:text-[var(--studio-midnight-black)] hover:decoration-[var(--studio-champagne-gold)]"
              >
                {contact.phoneDisplay}
              </a>
            ) : (
              "Not provided"
            )}
          </dd>
        </div>
      </dl>

      {contact.whatsappHref.trim() ? (
        <a
          href={contact.whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--studio-champagne-gold)] px-5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--studio-champagne-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--studio-champagne-gold)]"
        >
          {contact.detailsLabels.whatsapp}
        </a>
      ) : null}

      <p className="mt-4 text-xs text-[var(--color-muted)]">
        {contact.placeholderNote}
      </p>
    </div>
  );
}

export function GoogleMapsPlaceholder() {
  const { mapPlaceholder } = studioConfig.contact;

  return (
    <section
      aria-labelledby="maps-placeholder-title"
      className="group relative isolate min-h-[310px] overflow-hidden rounded-3xl border border-[#d8c5a9] bg-[#eae0d2] shadow-[0_12px_35px_rgba(50,35,20,0.07)] sm:min-h-[350px]"
    >
      {/* Map background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#f5eee4_0%,#e9dfd1_80%)]"
      />

      {/* Decorative streets */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden"
      >
        <span className="absolute left-[20%] top-[-25%] h-[150%] w-8 rotate-[24deg] border-x border-white/80" />

        <span className="absolute left-[67%] top-[-25%] h-[150%] w-10 -rotate-[32deg] border-x border-white/80" />

        <span className="absolute left-[-10%] top-[35%] h-7 w-[120%] -rotate-[8deg] border-y border-white/80" />

        <span className="absolute left-[-10%] top-[73%] h-8 w-[120%] rotate-[7deg] border-y border-white/80" />

        <span className="absolute left-[42%] top-[-10%] h-[120%] w-px rotate-[48deg] bg-white/50" />
      </div>

      {/* Top location label */}
      <div className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-4 py-2 shadow-sm backdrop-blur-md sm:left-7 sm:top-7">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-clay)] opacity-50 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-clay)]" />
        </span>

        <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink)]">
          Studio Location
        </span>
      </div>

      {/* Location pin */}
      <div className="absolute left-1/2 top-[40%] z-10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 group-hover:-translate-y-[55%]">
        <div className="absolute -inset-4 rounded-full border border-[var(--color-clay)]/20 motion-safe:animate-ping motion-reduce:animate-none" />

        <div className="relative grid h-16 w-16 place-items-center rounded-full border-[5px] border-white bg-[var(--studio-champagne-gold)] text-[var(--studio-midnight-black)] shadow-[0_10px_30px_rgba(50,35,20,0.22)]">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-7 w-7"
          >
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
          </svg>
        </div>
      </div>

      {/* Bottom information card */}
      <div className="absolute inset-x-4 bottom-4 z-20 rounded-2xl border border-white/80 bg-white/80 p-5 shadow-[0_12px_35px_rgba(50,35,20,0.10)] backdrop-blur-xl transition-transform duration-300 group-hover:-translate-y-1 sm:inset-x-6 sm:bottom-6 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eee2d2] text-[var(--color-clay)]">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
            >
              <path
                d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle
                cx="12"
                cy="9"
                r="2.3"
                stroke="currentColor"
                strokeWidth="1.7"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <h2
              id="maps-placeholder-title"
              className="font-serif text-xl text-[var(--color-ink)] sm:text-2xl"
            >
              {mapPlaceholder.title}
            </h2>

            <p className="mt-2 text-xs leading-6 text-[var(--color-muted)] sm:text-sm">
              {mapPlaceholder.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}