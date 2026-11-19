import Link from "next/link";
import type { Service } from "@/types/studio";
import { formatPrice } from "@/lib/format";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="premium-card flex h-full flex-col rounded-2xl p-6">
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
      <div className="mt-6 flex items-end justify-between gap-3 border-t border-[var(--color-line)] pt-5">
        <p className="text-sm text-[var(--color-muted)]">
          From{" "}
          <span className="inline-flex rounded-full bg-[var(--studio-champagne-gold)] px-2.5 py-1 font-semibold text-[var(--studio-midnight-black)]">
            {formatPrice(service.startingPrice)}
          </span>
          <span className="ml-1 text-xs">· demo</span>
        </p>
        <Link
          href={`/booking?shootType=${encodeURIComponent(service.category)}`}
          className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-[var(--studio-champagne-gold)] px-4 text-sm font-semibold text-[var(--studio-midnight-black)] transition-colors hover:bg-[var(--studio-warm-beige)]"
        >
          Book Now
        </Link>
      </div>
    </article>
  );
}
