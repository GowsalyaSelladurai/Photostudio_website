import { MessageCircle, Phone } from "lucide-react";
import { studioConfig } from "@/config/studio.config";

export function FloatingContact() {
  const { contact } = studioConfig;
  const phone = contact.phoneHref.trim();
  const whatsapp = contact.whatsappHref.trim();

  if (!phone && !whatsapp) return null;

  return (
    <div
      aria-label="Contact StudioFrame"
      className="fixed bottom-4 right-4 z-30 flex flex-row gap-3 sm:bottom-6 sm:right-6 sm:flex-col"
    >
      {phone ? (
        <a
          href={`tel:${phone}`}
          aria-label={`Call Us${studioConfig.demoMode ? " · demo contact" : ""}`}
          title="Call Us"
          className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-[var(--studio-champagne-gold)] text-[var(--studio-midnight-black)] shadow-lg shadow-black/15 transition-transform hover:-translate-y-1 hover:shadow-xl focus-visible:outline"
        >
          <Phone aria-hidden="true" size={20} strokeWidth={1.8} />
          <span className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-full bg-[var(--studio-deep-charcoal)] px-3 py-1.5 text-xs font-medium text-[var(--studio-ivory-white)] opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            Call Us
          </span>
        </a>
      ) : null}
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          aria-label={`WhatsApp${studioConfig.demoMode ? " · demo contact" : ""}`}
          title="WhatsApp"
          className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-[var(--studio-champagne-gold)] bg-[var(--studio-deep-charcoal)] text-[var(--studio-champagne-gold)] shadow-lg shadow-black/15 transition-transform hover:-translate-y-1 hover:bg-[var(--studio-champagne-gold)] hover:text-[var(--studio-midnight-black)] hover:shadow-xl focus-visible:outline"
        >
          <MessageCircle aria-hidden="true" size={21} strokeWidth={1.8} />
          <span className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-full bg-[var(--studio-deep-charcoal)] px-3 py-1.5 text-xs font-medium text-[var(--studio-ivory-white)] opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            WhatsApp
          </span>
        </a>
      ) : null}
    </div>
  );
}
