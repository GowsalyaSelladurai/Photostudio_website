import Link from "next/link";
import { studioConfig } from "@/config/studio.config";

export function SiteFooter() {
  return (
    <footer className="bg-[var(--color-ink)] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="font-serif text-3xl">
            {studioConfig.name}
            <span className="text-[var(--color-clay-light)]">.</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
            {studioConfig.description}
          </p>
          {studioConfig.demoMode ? (
            <p className="mt-4 inline-flex rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
              Demonstration studio · sample content
            </p>
          ) : null}
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Explore
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
            <li><Link href="/services" className="hover:text-white">Services</Link></li>
            <li><Link href="/booking" className="hover:text-white">Booking</Link></li>
            <li><a href={studioConfig.priceCatalogueHref} download className="hover:text-white">Price catalogue · demo</a></li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Find us
          </h2>
          <address className="mt-4 space-y-3 text-sm not-italic leading-6 text-white/80">
            <p>{studioConfig.contact.address}</p>
            <a href={`mailto:${studioConfig.contact.email}`} className="block hover:text-white">
              {studioConfig.contact.email}
            </a>
            <a href={`tel:${studioConfig.contact.phoneHref}`} className="block hover:text-white">
              {studioConfig.contact.phoneDisplay}
            </a>
          </address>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-white/55 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {studioConfig.name}. Demo website.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">Privacy policy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
