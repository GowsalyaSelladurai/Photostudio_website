
import type { Metadata } from "next";
import { services } from "@/config/studio.config";
import { ServiceCard } from "@/components/ui/service-card";

export const metadata: Metadata = { title: "Services" };

const categories = [
  "Weddings",
  "Pre-Wedding",
  "Baby Stories",
  "Family Portraits",
  "Celebrations",
  "Fine Portraits",
];

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[var(--color-sand)] px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">

          {/* Editorial top line */}
          <div className="flex items-center justify-between border-y border-[#b99a72]/40 py-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#94734e]">
              Studio Collection
            </span>

            <span className="text-[10px] tracking-[0.25em] text-[#94734e]">
              2026 — 2027
            </span>
          </div>

          {/* Moving editorial strip */}
          <div className="relative overflow-hidden py-9 sm:py-12">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--color-sand)] to-transparent sm:w-24" />

            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--color-sand)] to-transparent sm:w-24" />

            <div className="flex w-max animate-[services-marquee_32s_linear_infinite] hover:[animation-play-state:paused]">
              {[0, 1].map((group) => (
                <div
                  key={group}
                  className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12"
                  aria-hidden={group === 1}
                >
                  {categories.map((category, index) => (
                    <div
                      key={category}
                      className="flex items-center gap-8 sm:gap-12"
                    >
                      <span className="whitespace-nowrap font-serif text-3xl text-[#28231e] sm:text-5xl lg:text-6xl">
                        {category}
                      </span>

                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#b99a72]/60 text-xs text-[#a17b50] sm:h-10 sm:w-10">
                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                      </span>

                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#b99a72]" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Editorial bottom line */}
          <div className="flex items-center justify-between border-t border-[#b99a72]/40 pt-4">
            <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-[#94734e] sm:text-[10px]">
              Moments · Memories · Stories
            </span>

            <span className="font-serif text-sm italic text-[#94734e]">
              Made to be remembered.
            </span>
          </div>
        </div>

        <style>{`
          @keyframes services-marquee {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .animate-\\[services-marquee_32s_linear_infinite\\] {
              animation: none;
            }
          }
        `}</style>
      </section>

      {/* Existing service cards - unchanged */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </>
  );
}
