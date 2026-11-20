"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { studioConfig } from "@/config/studio.config";
import { destinations } from "@/data/journeys";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/film", label: "Film" },
  { href: "/services", label: "Services" },
  { href: "/frames", label: "Frames" },
  { href: "/albums", label: "Albums" },
  { label: "Journeys", dropdown: true },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [journeysOpen, setJourneysOpen] = useState(false);
  const [journeysPinned, setJourneysPinned] = useState(false);
  const isJourneyActive = pathname.startsWith("/journeys/");

  return (
    <header className="sticky top-0 z-40 border-b border-[color-mix(in_srgb,var(--studio-champagne-gold)_35%,transparent)] bg-[color-mix(in_srgb,var(--studio-ivory-white)_96%,transparent)] text-[var(--studio-midnight-black)] backdrop-blur-md">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 xl:min-h-[4.5rem]">
        <Link
          href="/"
          aria-label={`${studioConfig.name} home`}
          onClick={() => setMenuOpen(false)}
          className="w-fit shrink-0 font-serif text-2xl tracking-tight text-[var(--studio-midnight-black)] transition-colors hover:text-[var(--studio-champagne-gold)]"
        >
          {studioConfig.name}
          <span className="ml-1 text-[var(--studio-champagne-gold)]">.</span>
        </Link>

        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--studio-champagne-gold)_65%,transparent)] text-[var(--studio-midnight-black)] transition-colors hover:bg-[var(--studio-warm-beige)] xl:hidden"
        >
          {menuOpen ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>

        <nav
          id="primary-navigation"
          aria-label="Main navigation"
          className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-1 border-t border-[color-mix(in_srgb,var(--studio-champagne-gold)_35%,transparent)] bg-[var(--studio-ivory-white)] px-5 py-4 shadow-xl sm:px-8 xl:static xl:flex xl:flex-row xl:items-center xl:gap-1 xl:border-0 xl:p-0 xl:shadow-none`}
        >
          {navigation.map((item) => {
            if ("dropdown" in item) {
              return (
                <div
                  key="journeys"
                  className="group relative"
                  onMouseEnter={() => setJourneysOpen(true)}
                  onMouseLeave={() => {
                    if (!journeysPinned) {
                      setJourneysOpen(false);
                    }
                  }}
                >

                  {/* Journeys Button */}
                  <button
                    type="button"
                    aria-expanded={journeysOpen}
                    aria-current={isJourneyActive ? "page" : undefined}
                    onClick={() => {
                      const nextPinned = !journeysPinned;
                      setJourneysPinned(nextPinned);
                      setJourneysOpen(nextPinned);
                    }}
                    className={`relative inline-flex min-h-11 w-full items-center px-3 text-left text-sm transition-colors duration-300 after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:bg-[var(--studio-champagne-gold)] after:transition-transform xl:w-auto ${
                      isJourneyActive
                        ? "font-semibold text-[var(--studio-midnight-black)] after:scale-x-100"
                        : "font-medium text-[var(--studio-deep-charcoal)] after:scale-x-0 hover:text-[var(--studio-midnight-black)] hover:after:scale-x-100"
                    }`}
                  >
                    Journeys
                  </button>

                  {/* Dropdown */}
                  <div
                    className={`${
                      journeysOpen
                        ? "visible pointer-events-auto translate-y-0 opacity-100"
                        : "invisible pointer-events-none translate-y-3 opacity-0"
                    } absolute left-0 top-full z-50 mt-3 w-[250px] origin-top rounded-xl border border-[color-mix(in_srgb,var(--studio-champagne-gold)_35%,transparent)] bg-[var(--studio-midnight-black)] py-3 shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition-all duration-300 ease-out `}
                  >   

                    {destinations.map((destination) => {
                      const active =
                        pathname === `/journeys/${destination.slug}`;

                      return (
                        <Link
                          key={destination.slug}
                          href={`/journeys/${destination.slug}`}
                          onClick={() => {
                            setMenuOpen(false);
                            setJourneysOpen(false);
                            setJourneysPinned(false);
                          }}
                          className={`group/item flex items-center justify-between px-6 py-3 font-serif text-base italic transition-all duration-300 hover:translate-x-1 hover:bg-[var(--studio-deep-charcoal)] hover:text-[var(--studio-champagne-gold)] ${
                            active
                              ? "text-[var(--studio-champagne-gold)]"
                              : "text-[var(--studio-ivory-white)]/80"
                          }`}
                        >
                          {destination.name}

                          <span className="text-xs text-[var(--studio-champagne-gold)] opacity-0 transition-opacity duration-300 group-hover/item:opacity-100">
                            →
                          </span>
                        </Link>
                      );
                    })}

                  </div>
                </div>
              );
            }
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`relative inline-flex min-h-11 items-center px-3 text-sm transition-colors after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:bg-[var(--studio-champagne-gold)] after:transition-transform ${
                  active
                      ? "font-semibold text-[var(--studio-midnight-black)] after:scale-x-100"
                      : "font-medium text-[var(--studio-deep-charcoal)] after:scale-x-0 hover:text-[var(--studio-midnight-black)] hover:after:scale-x-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/booking"
            aria-current={pathname === "/booking" ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
            className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--studio-champagne-gold)] px-5 text-sm font-semibold text-[var(--studio-midnight-black)] transition-colors hover:bg-[var(--studio-warm-beige)] xl:ml-3 xl:mt-0"
          >
            Book Now
          </Link>
        </nav>
      </div>
    </header>
  );
}