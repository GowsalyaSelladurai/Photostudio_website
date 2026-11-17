import Link from "next/link";
import { studioConfig } from "@/config/studio.config";

const navigation = [
  { href: "/gallery", label: "Gallery" },
  { href: "/services", label: "Services" },
  { href: "/frames", label: "Frames" },
  { href: "/albums", label: "Albums" },
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-paper)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <Link
          href="/"
          aria-label={`${studioConfig.name} home`}
          className="w-fit font-serif text-2xl tracking-tight text-[var(--color-ink)]"
        >
          {studioConfig.name}
          <span className="ml-1 text-[var(--color-clay)]">.</span>
        </Link>
        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/booking"
            className="inline-flex min-h-10 items-center rounded-full bg-[var(--color-ink)] px-5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-clay)] sm:text-sm"
          >
            Book now
          </Link>
        </nav>
      </div>
    </header>
  );
}
