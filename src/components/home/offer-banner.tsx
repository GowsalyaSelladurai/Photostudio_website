import { studioConfig } from "@/config/studio.config";

export function OfferBanner() {
  return (
    <section className="bg-[var(--color-sand)] px-5 py-5 text-center sm:px-8">
      <p className="text-sm text-[var(--color-ink)]">
        <span className="font-semibold">{studioConfig.offer.label}:</span>{" "}
        {studioConfig.offer.message}{" "}
        <span className="text-xs text-[var(--color-muted)]">(demo offer)</span>
      </p>
    </section>
  );
}
