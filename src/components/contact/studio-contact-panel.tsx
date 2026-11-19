
import { studioConfig } from "@/config/studio.config";

export function StudioContactPanel() {
  const { contact } = studioConfig;

  return (
    <section className="relative overflow-hidden border border-[#bd9b70]/30 bg-[#29251f] p-5 sm:p-7">

      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#bd9b70]/10 blur-3xl" />

      <div className="relative">
        <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#bd9b70]">
          CONNECT WITH US
        </p>

        <h2 className="mt-3 font-serif text-2xl text-[#f3eee6]">
          Let's create something meaningful.
        </h2>

        <p className="mt-2 max-w-sm text-xs leading-6 text-white/50">
          Have a story to capture? We would love to hear from you.
        </p>

        <div className="my-6 h-px bg-white/10" />

        <div className="space-y-5">

          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#bd9b70]">
              Studio Location
            </p>
            <p className="mt-2 text-sm text-white/80">
              {contact.mapLocation}
            </p>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#bd9b70]">
              Studio Hours
            </p>
            <p className="mt-2 text-sm text-white/70">
              {contact.hours}
            </p>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#bd9b70]">
              Email
            </p>
            <div className="mt-2 text-sm text-white/70">
              {contact.email.trim() ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="transition-colors hover:text-[#bd9b70]"
                >
                  {contact.email}
                </a>
              ) : "Email will be updated soon"}
            </div>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#bd9b70]">
              Phone
            </p>
            <div className="mt-2 text-sm text-white/70">
              {contact.phoneHref.trim() ? (
                <a
                  href={`tel:${contact.phoneHref}`}
                  className="transition-colors hover:text-[#bd9b70]"
                >
                  {contact.phoneDisplay}
                </a>
              ) : "Phone will be updated soon"}
            </div>
          </div>

        </div>

        {contact.whatsappHref.trim() && (
          <a
            href={contact.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center gap-3 border border-[#bd9b70] px-5 py-3 text-xs font-semibold text-[#bd9b70] transition-all duration-300 hover:bg-[#bd9b70] hover:text-[#171717]"
          >
            WhatsApp Us
            <span>↗</span>
          </a>
        )}

      </div>
    </section>
  );
}

export function GoogleMapsPlaceholder() {
  const { mapLocation } = studioConfig.contact;

  const mapQuery = encodeURIComponent(mapLocation);

  const mapUrl =
    `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

  return (
    <section className="group relative overflow-hidden border border-[#bd9b70]/30 bg-[#171717]">

      {/* AMBIENT LIGHTING */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#bd9b70]/15 blur-[90px] transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">

        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#bd9b70]">
            FIND OUR STUDIO
          </p>

          <h2 className="mt-1 font-serif text-xl text-[#f3eee6]">
            Explore our location.
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#bd9b70] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#bd9b70]" />
          </span>
          <span className="text-[8px] uppercase tracking-widest text-white/50">
            Location
          </span>
        </div>
      </div>

      {/* REAL INTERACTIVE MAP */}
      <div className="relative h-[280px] overflow-hidden sm:h-[340px]">

        <iframe
          title={`Google Map - ${mapLocation}`}
          src={mapUrl}
          width="100%"
          height="100%"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />

        {/* GOLD EDGE LIGHTING */}
        <div className="pointer-events-none absolute inset-0 border border-[#bd9b70]/20 shadow-[inset_0_0_35px_rgba(189,155,112,0.15)]" />

      </div>

      {/* MAP FOOTER */}
      <div className="relative flex flex-col justify-between gap-4 border-t border-[#bd9b70]/30 px-5 py-5 sm:flex-row sm:items-center sm:px-6">

        <div>
          <p className="font-serif text-lg text-[#f3eee6]">
            {mapLocation}
          </p>

          <p className="mt-1 text-[10px] tracking-wide text-white/40">
            Find your way to StudioFrame
          </p>
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-3 border border-[#bd9b70] bg-[#bd9b70] px-5 py-3 text-xs font-semibold text-[#171717] transition-all duration-300 hover:bg-transparent hover:text-[#bd9b70]"
        >
          Get Directions
          <span>↗</span>
        </a>

      </div>

    </section>
  );
}
