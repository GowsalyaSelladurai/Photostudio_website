import { studioConfig } from "@/config/studio.config";

export function FloatingContact() {
  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col gap-2">
      <a
        href={studioConfig.contact.whatsappHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Message StudioFrame on WhatsApp (demo contact)"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#395d4b] text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105"
      >
        W
      </a>
      <a
        href={`tel:${studioConfig.contact.phoneHref}`}
        aria-label={`Call StudioFrame at ${studioConfig.contact.phoneDisplay} (demo contact)`}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-ink)] text-lg text-white shadow-lg transition-transform hover:scale-105"
      >
        ☎
      </a>
    </div>
  );
}
