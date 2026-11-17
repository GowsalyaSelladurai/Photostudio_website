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
            ) : "Not provided"}
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
            ) : "Not provided"}
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
      className="relative isolate min-h-64 overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-sand)]"
    >
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <span className="absolute left-[24%] top-[-15%] h-[140%] w-5 rotate-[24deg] rounded-full border-x border-white/80" />
        <span className="absolute left-[64%] top-[-15%] h-[140%] w-7 -rotate-[32deg] rounded-full border-x border-white/80" />
        <span className="absolute left-[-10%] top-[36%] h-5 w-[120%] -rotate-[8deg] rounded-full border-y border-white/80" />
        <span className="absolute left-[-10%] top-[72%] h-7 w-[120%] rotate-[7deg] rounded-full border-y border-white/80" />
        <span className="absolute left-[49%] top-[35%] grid h-12 w-12 place-items-center rounded-full bg-[var(--studio-champagne-gold)] text-2xl text-[var(--studio-midnight-black)] shadow-lg">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
          </svg>
        </span>
      </div>
      <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/70 bg-white/90 p-4 backdrop-blur sm:inset-x-6 sm:bottom-6 sm:p-5">
        <h2
          id="maps-placeholder-title"
          className="font-serif text-xl text-[var(--color-ink)]"
        >
          {mapPlaceholder.title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
          {mapPlaceholder.description}
        </p>
      </div>
    </section>
  );
}
