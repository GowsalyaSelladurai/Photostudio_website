import Link from "next/link";
import { studioConfig } from "@/config/studio.config";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/services", label: "Services" },
  { href: "/frames", label: "Frames" },
  { href: "/albums", label: "Albums" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  const { contact } = studioConfig;

  return (
    <footer className="bg-[var(--studio-deep-charcoal)] text-[var(--studio-ivory-white)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_0.8fr] lg:gap-10">
        <div>
          <Link
            href="/"
            className="font-serif text-3xl tracking-tight transition-colors hover:text-[var(--studio-champagne-gold)]"
          >
            {studioConfig.name}
            <span className="text-[var(--studio-champagne-gold)]">.</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--studio-ivory-white)]/80">
            {studioConfig.description}
          </p>
          {studioConfig.demoMode ? (
            <p className="mt-4 inline-flex rounded-full border border-[color-mix(in_srgb,var(--studio-champagne-gold)_55%,transparent)] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--studio-ivory-white)]/80">
              Demonstration studio · sample content
            </p>
          ) : null}
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--studio-champagne-gold)]">
            Explore
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-[var(--studio-ivory-white)]/85">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-[var(--studio-champagne-gold)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="col-span-2">
              <a
                href={studioConfig.priceCatalogueHref}
                download
                className="transition-colors hover:text-[var(--studio-champagne-gold)]"
              >
                Download price catalogue
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--studio-champagne-gold)]">
            Contact · demo details
          </h2>
          <address className="mt-4 space-y-3 text-sm not-italic leading-6 text-[var(--studio-ivory-white)]/85">
            <p>{contact.address}</p>
            {contact.email.trim() ? (
              <a
                href={`mailto:${contact.email}`}
                className="block transition-colors hover:text-[var(--studio-champagne-gold)]"
              >
                {contact.email}
              </a>
            ) : null}
            {contact.phoneHref.trim() ? (
              <a
                href={`tel:${contact.phoneHref}`}
                className="block transition-colors hover:text-[var(--studio-champagne-gold)]"
              >
                {contact.phoneDisplay}
              </a>
            ) : null}
            {contact.whatsappHref.trim() ? (
              <a
                href={contact.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="block transition-colors hover:text-[var(--studio-champagne-gold)]"
              >
                WhatsApp · demo contact
              </a>
            ) : null}
          </address>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--studio-champagne-gold)]">
            Follow
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-[var(--studio-ivory-white)]/85">
            {contact.socialLinks.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-[var(--studio-champagne-gold)]"
                >
                  {item.name}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/privacy"
                className="transition-colors hover:text-[var(--studio-champagne-gold)]"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="transition-colors hover:text-[var(--studio-champagne-gold)]"
              >
                Terms and Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[color-mix(in_srgb,var(--studio-champagne-gold)_35%,transparent)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-[var(--studio-ivory-white)]/75 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {studioConfig.name}.{" "}
            {studioConfig.demoMode ? "Demo website." : ""}
          </p>
          <p className="uppercase tracking-[0.16em]">Made to keep close</p>
        </div>
      </div>
    </footer>
  );
}
