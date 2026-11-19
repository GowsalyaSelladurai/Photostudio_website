
import Link from "next/link";
import type { Service } from "@/types/studio";
import { formatPrice } from "@/lib/format";


export const serviceImages: Record<string, string> = {
  wedding:
    "https://cdn0.weddingwire.in/article/3777/original/960/jpg/7773-manan-photography-malayali-bride-kanyaadanam-ritual.jpeg",

  

"pre-wedding":
  "https://pub-27b08ca42de846119fe71d8c460d36c9.r2.dev/wp-uploads/2026/10/pre-wedding-magic-malarikal-shneka-deepak/candid-back-hug-romantic-couple-shoot-malarikal-water-lily.jpg",


  baby:
    "https://babynmeindia.com/cdn/shop/files/IMG_6042_20_1_.jpeg_4_huhu.png?v=1765540602&width=1946",

  passport:
    "https://passprint.in/landing/gallery-single.jpg",

  events:
    "https://media.assettype.com/outlooktraveller/2024-09-14/dhzgu0ix/onam.jpg?auto=format%2Ccompress&enlarge=true&fit=max&h=900&w=1200",

  video:
    "https://itsmy.wedding/images/blog/chennai/wedding-videography-cost-chennai-hero.webp",

  editing:
    "https://khushmag.com/Images/ExtraImages/Behind-the-Scenes-Eye-Jogia-4.jpg",
};

export function ServiceCard({
  service,
  variant = "default",
}: {
  service: Service;
  variant?: "default" | "preview";
}) {
  const image = serviceImages[service.id];

  if (variant === "preview") {
    return (
      <article
        id={`service-${service.id}`}
        className="group overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--studio-ivory-white)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--studio-champagne-gold)] hover:shadow-lg hover:shadow-black/10"
      >
        <div
          role="img"
          aria-label={`${service.name} photography`}
          className="h-40 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03] sm:h-44"
          style={{ backgroundImage: `url("${image}")` }}
        />
        <div className="p-4 sm:p-5">
          <h3 className="font-serif text-2xl leading-tight text-[var(--studio-midnight-black)]">
            {service.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-muted)]">
            {service.description}
          </p>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--color-line)] pt-3">
            <p className="text-sm font-medium text-[var(--studio-deep-charcoal)]">
              From {formatPrice(service.startingPrice)}
            </p>
            <Link
              href={`/services#service-${service.id}`}
              className="inline-flex min-h-10 items-center text-xs font-semibold text-[var(--studio-deep-charcoal)] underline decoration-[var(--studio-champagne-gold)] decoration-2 underline-offset-4 transition-colors hover:text-[var(--studio-midnight-black)]"
            >
              View details
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article id={`service-${service.id}`} className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--studio-ivory-white)] text-[var(--studio-midnight-black)] transition-all duration-500 hover:-translate-y-1 hover:border-[var(--studio-champagne-gold)] hover:shadow-xl hover:shadow-black/10">

      {/* Cinematic Image */}
      <div className="relative h-72 overflow-hidden bg-[#222]">
        <div
          role="img"
          aria-label={`${service.name} photography`}
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
          style={{
            backgroundImage: `url("${image}")`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

        <span className="absolute left-5 top-5 border border-white/30 bg-black/30 px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-white backdrop-blur-md">
          {service.category}
        </span>

        <span className="absolute bottom-5 right-5 font-serif text-sm italic text-white/70">
          StudioFrame
        </span>
      </div>

      {/* Service Information */}
      <div className="flex flex-1 flex-col p-6 sm:p-7">

        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-[#b69a70]" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#b69a70]">
            Photography Experience
          </span>
        </div>

        <h3 className="font-serif text-3xl font-normal leading-tight tracking-wide text-[var(--studio-midnight-black)]">
          {service.name}
        </h3>

        <p className="mt-4 flex-1 text-sm leading-7 text-[var(--color-muted)]">
          {service.description}
        </p>

        {/* Inclusions */}
        <div className="mt-7 border-t border-[var(--color-line)] pt-6">

          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b69a70]">
            The Experience Includes
          </p>

          <ul className="space-y-3">
            {service.inclusions.map((inclusion) => (
              <li
                key={inclusion}
                className="flex items-start gap-3 text-sm text-[var(--color-muted)]"
              >
                <span className="mt-1 text-xs text-[#b69a70]">✳</span>
                <span>{inclusion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing and Booking */}
        <div className="mt-7 flex items-end justify-between gap-3 border-t border-[var(--color-line)] pt-6">

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Packages from
            </p>

            <p className="mt-2 font-serif text-2xl text-[#e2c49b]">
              {formatPrice(service.startingPrice)}
            </p>
          </div>

          <Link
            href={`/booking?shootType=${encodeURIComponent(service.category)}`}
            className="group/btn inline-flex items-center gap-3 border border-[#b69a70]/60 px-5 py-3 text-xs font-medium uppercase tracking-widest text-[#e2c49b] transition-all duration-300 hover:bg-[#b69a70] hover:text-[#111110]"
          >
            Explore
            <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
              →
            </span>
          </Link>

        </div>
      </div>
    </article>
  );
}
