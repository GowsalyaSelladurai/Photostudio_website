
"use client";

import { useState } from "react";
import {
  albumPricing,
  framePricing,
  studioConfig,
} from "@/config/studio.config";
import type { PriceOption } from "@/types/studio";
import { formatAlbumPrice, formatPrice } from "@/lib/format";

type ConfiguratorKind = "frame" | "album";

type OptionGroup = {
  label: string;
  options: readonly PriceOption[];
};

export function PricingConfigurator({
  kind,
}: {
  kind: ConfiguratorKind;
}) {
  const isAlbum = kind === "album";

  const groups: OptionGroup[] = isAlbum
    ? [
        { label: "Size", options: albumPricing.sizes },
        { label: "Pages", options: albumPricing.pages },
        { label: "Finish type", options: albumPricing.finishes },
      ]
    : [
        { label: "Size", options: framePricing.sizes },
        { label: "Material", options: framePricing.materials },
        { label: "Customization", options: framePricing.customizations },
      ];

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      groups.map((group) => [group.label, group.options[0].id]),
    ),
  );

  const priceFormatter = isAlbum ? formatAlbumPrice : formatPrice;

  const total = groups.reduce((sum, group) => {
    const option = group.options.find(
      (item) => item.id === selected[group.label],
    );

    return sum + (option?.amount ?? 0);
  }, 0);

  return (
    <div className="premium-card rounded-3xl p-6 sm:p-9">
      <div className="grid gap-7 md:grid-cols-3">
        {groups.map((group) => (
          <fieldset key={group.label} className="min-w-0">
            <legend className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
              {group.label}
            </legend>

            <div className="grid gap-2">
              {group.options.map((option) => {
                const isSelected =
                  selected[group.label] === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() =>
                      setSelected((current) => ({
                        ...current,
                        [group.label]: option.id,
                      }))
                    }
                    className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors focus-visible:outline ${
                      isSelected
                        ? "border-[var(--studio-champagne-gold)] bg-[var(--studio-warm-beige)] text-[var(--studio-midnight-black)] shadow-sm"
                        : "border-[var(--color-line)] bg-[var(--studio-ivory-white)] text-[var(--studio-deep-charcoal)] hover:border-[var(--studio-champagne-gold)]"
                    }`}
                  >
                    <span>{option.label}</span>

                    <span className="shrink-0 text-xs font-semibold">
                      {option.amount
                        ? `+ ${priceFormatter(option.amount)}`
                        : "Included"}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-[var(--color-line)] pt-6">
        <div>
          <p className="inline-flex rounded-full bg-[var(--studio-champagne-gold)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--studio-midnight-black)]">
            Demo estimate
          </p>

          <p
            aria-live="polite"
            className="mt-2 font-serif text-4xl text-[var(--color-ink)]"
          >
            {priceFormatter(total)}
          </p>

          <p className="mt-2 text-xs text-[var(--color-muted)]">
            {isAlbum
              ? "Sample INR prices for demonstration only."
              : `Sample ${studioConfig.currency} prices for demonstration only.`}
          </p>
        </div>

        <a
          href={studioConfig.priceCatalogueHref}
          download
          className="text-sm font-semibold text-[var(--color-clay)] underline-offset-4 hover:underline"
        >
          Download demo catalogue
        </a>
      </div>
    </div>
  );
}
