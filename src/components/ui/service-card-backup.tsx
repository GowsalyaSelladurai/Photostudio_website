
import Link from "next/link";
import type { Service } from "@/types/studio";
import { formatPrice } from "@/lib/format";

const serviceImages: Record<string, string> = {
  wedding:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85",
  "pre-wedding":
    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=85",
  baby:
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=85",
  passport:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
  events:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=85",
  video:
    "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1200&q=85",
  editing:
    "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=85",
};

export function ServiceCard({ service }: { service: Service }) {
  const image = serviceImages[service.id];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">

      <div className="relative h-64 overflow-hidden bg-[var(--color-sand)]">
        <div
          role="img"
          aria-label={`${service.name} photography`}
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url("${image}")` }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <span className="absolute bottom-5 left-5 rounded-full border border-white/50 bg-black/20 px-4 py-2 text-xs font-medium uppercase tracking-widest text-white backdrop-blur-sm">
          {service.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">

        <h3 className="font-serif text-2xl text-[var(--color-ink)]">
          {service.name}
        </h3>

        <p className="mt-3 flex-1 text-sm leading-7 text-[var(--color-muted)]">
          {service.description}
        </p>

        <div className="mt-5 border-t border-[var(--color-line)] pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-clay)]">
            What's included
          </p>

          <ul className="space-y-2">
            {service.inclusions.map((inclusion) => (
              <li
                key={inclusion}
                className="flex gap-3 text-sm text-[var(--color-ink)]"
              >
                <span className="text-[var(--color-clay)]">✳</span>
                {inclusion}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-[var(--color-line)] pt-5">

          <div>
            <p className="text-xs text-[var(--color-muted)]">
              Starting from
            </p>
            <p className="mt-1 text-xl font-semibold text-[var(--color-ink)]">
              {formatPrice(service.startingPrice)}
            </p>
          </div>

          <Link
            href={`/booking?shootType=${encodeURIComponent(service.category)}`}
            className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-clay)]"
          >
            Book now →
          </Link>

        </div>
      </div>
    </article>
  );
}
