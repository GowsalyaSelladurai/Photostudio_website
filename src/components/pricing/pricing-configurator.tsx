"use client";

import { useState } from "react";
import { albumPricing, framePricing, studioConfig } from "@/config/studio.config";
import type { PriceOption } from "@/types/studio";
import { formatPrice } from "@/lib/format";

type ConfiguratorKind = "frame" | "album";
type OptionGroup = { label: string; options: PriceOption[] };

export function PricingConfigurator({ kind }: { kind: ConfiguratorKind }) {
  const groups: OptionGroup[] =
    kind === "frame"
      ? [
          { label: "Size", options: framePricing.sizes },
          { label: "Material", options: framePricing.materials },
          { label: "Customization", options: framePricing.customizations },
        ]
      : [
          { label: "Size", options: albumPricing.sizes },
          { label: "Pages", options: albumPricing.pages },
          { label: "Finish type", options: albumPricing.finishes },
        ];
  const [selected, setSelected] = useState<Record<string, string>>(
    Object.fromEntries(groups.map((group) => [group.label, group.options[0].id])),
  );
  const total = groups.reduce((sum, group) => {
    const option = group.options.find((item) => item.id === selected[group.label]);
    return sum + (option?.amount ?? 0);
  }, 0);

  return (
    <div className="rounded-3xl border border-[var(--color-line)] bg-white p-6 sm:p-9">
      <div className="grid gap-6 sm:grid-cols-2">
        {groups.map((group) => (
          <label key={group.label} className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
              {group.label}
            </span>
            <select
              value={selected[group.label]}
              onChange={(event) =>
                setSelected((current) => ({
                  ...current,
                  [group.label]: event.target.value,
                }))
              }
              className="min-h-12 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] px-4 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-clay)] focus:ring-2 focus:ring-[var(--color-clay)]/20"
            >
              {group.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-[var(--color-line)] pt-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Demo estimate</p>
          <p className="mt-1 font-serif text-4xl text-[var(--color-ink)]">{formatPrice(total)}</p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Sample {studioConfig.currency} prices for demonstration only.
          </p>
        </div>
        <a href={studioConfig.priceCatalogueHref} download className="text-sm font-semibold text-[var(--color-clay)] underline-offset-4 hover:underline">
          Download demo catalogue
        </a>
      </div>
    </div>
  );
}
