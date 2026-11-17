import Link from "next/link";
import type { Service } from "@/types/studio";
import { formatPrice } from "@/lib/format";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--color-line)] bg-white p-6 transition-transform hover:-translate-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">
        {service.category}
      </p>
      <h3 className="mt-4 font-serif text-2xl text-[var(--color-ink)]">
        {service.name}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-[var(--color-muted)]">
        {service.description}
      </p>
      <ul className="mt-5 space-y-2 text-sm text-[var(--color-ink)]">
        {service.inclusions.map((inclusion) => (
          <li key={inclusion} className="flex gap-2">
            <span aria-hidden="true" className="text-[var(--color-clay)]">
              +
            </span>
            {inclusion}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-end justify-between border-t border-[var(--color-line)] pt-5">
        <p className="text-sm text-[var(--color-muted)]">
          From{" "}
          <span className="font-semibold text-[var(--color-ink)]">
            {formatPrice(service.startingPrice)}
          </span>
          <span className="ml-1 text-xs">          · demo</span>
        </p>
        <Link
          href={`/booking?shootType=${encodeURIComponent(service.category)}`}
          className="text-sm font-semibold text-[var(--color-clay)] underline-offset-4 hover:underline"
        >
          Book now
        </Link>
      </div>
    </article>
  );
}
