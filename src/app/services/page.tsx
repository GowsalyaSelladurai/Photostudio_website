import Link from "next/link";
import type { Metadata } from "next";
import { services } from "@/config/studio.config";
import { ServiceCard } from "@/components/ui/service-card";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore the photography experiences offered by StudioFrame.",
};

const categories = [
  "Weddings",
  "Pre-Wedding",
  "Baby Stories",
  "Family Portraits",
  "Celebrations",
  "Fine Portraits",
];

const highlights = [
  { number: "01", title: "Creative Vision", icon: "✧" },
  { number: "02", title: "Premium Quality", icon: "◇" },
  { number: "03", title: "Timeless Memories", icon: "✦" },
  { number: "04", title: "Personal Experience", icon: "✧" },
];

export default function ServicesPage() {
  return (
    <main className="services-page relative overflow-hidden bg-[var(--color-paper)] text-[var(--studio-deep-charcoal)]">

      {/* AMBIENT BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="sf-ambient absolute -left-40 top-20 h-[400px] w-[400px] rounded-full bg-[#B89970]/15 blur-[130px]" />
        <div className="sf-ambient sf-ambient-two absolute -right-40 top-[35%] h-[450px] w-[450px] rounded-full bg-[#B89970]/10 blur-[140px]" />
        <div className="sf-ambient absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-[#E8DDCE]/50 blur-[120px]" />
      </div>

      {/* HERO */}
      <section className="sf-hero relative z-10 min-h-[690px] overflow-hidden border-b border-[#B89970]/30 lg:min-h-[740px]">

        <div className="sf-grid pointer-events-none absolute inset-0 opacity-[0.13]" />

        <div className="sf-beam pointer-events-none absolute inset-y-0 left-[20%] w-px" />
        <div className="sf-beam sf-beam-two pointer-events-none absolute inset-y-0 right-[20%] w-px" />

        <div className="relative mx-auto flex min-h-[690px] max-w-[1500px] flex-col justify-center px-5 py-16 sm:px-10 lg:min-h-[740px] lg:px-16">

          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">

            <div className="relative z-20">

              <div className="sf-reveal-left mb-7 flex items-center gap-4">
                <span className="h-px w-12 bg-[#B89970]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#806447] sm:text-xs">
                  StudioFrame / Photography Services
                </span>
              </div>

              <p className="sf-reveal text-xs uppercase tracking-[0.3em] text-[#806447]">
                Every moment has a story
              </p>

              <h1 className="mt-5 max-w-3xl font-serif text-[clamp(3.2rem,7vw,6.5rem)] font-medium leading-[0.98] tracking-tight text-[#292522]">
                <span className="sf-reveal block">The Art of</span>
                <span className="sf-reveal sf-delay-1 block">Capturing</span>
                <span className="sf-reveal sf-delay-2 block bg-gradient-to-r from-[#806447] via-[#B89970] to-[#806447] bg-clip-text italic text-transparent">
                  Life's Magic.
                </span>
              </h1>

              <p className="sf-reveal sf-delay-3 mt-7 max-w-xl text-sm leading-8 text-[#62574C] sm:text-base">
                From unforgettable celebrations to beautiful portraits,
                we transform your precious moments into extraordinary
                visual stories that last forever.
              </p>

              <div className="sf-reveal sf-delay-4 mt-9 flex flex-wrap items-center gap-5">

                <Link
                  href="#services"
                  className="sf-button group relative inline-flex items-center gap-4 overflow-hidden rounded-full bg-[#B89970] px-7 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#171717] shadow-lg shadow-[#B89970]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#A78660] hover:shadow-xl"
                >
                  <span className="relative z-10">Explore Services</span>
                  <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-2">→</span>
                </Link>

                <span className="text-xs text-[#806447]">
                  Crafted with passion. Captured forever.
                </span>

              </div>

              <div className="sf-reveal sf-delay-4 mt-12 grid max-w-[470px] grid-cols-3 border-t border-[#B89970]/50 pt-6">

                {[
                  ["01", "Creativity"],
                  ["02", "Precision"],
                  ["03", "Memories"],
                ].map(([number, label], index) => (
                  <div
                    key={number}
                    className={
                      index === 1
                        ? "border-x border-[#B89970]/40 pl-5"
                        : index === 2
                          ? "pl-5"
                          : ""
                    }
                  >
                    <p className="font-serif text-3xl text-[#A78660]">{number}</p>
                    <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-[#806447]">{label}</p>
                  </div>
                ))}

              </div>
            </div>

            {/* CINEMATIC CAMERA */}
            <div className="sf-visual relative mx-auto flex aspect-square w-full max-w-[540px] items-center justify-center">

              <div className="sf-glow absolute inset-[15%] rounded-full bg-[#B89970]/20 blur-[100px]" />

              <div className="sf-orbit sf-orbit-one absolute inset-[7%] rounded-full border border-[#B89970]/60" />
              <div className="sf-orbit sf-orbit-two absolute inset-[17%] rounded-full border border-dashed border-[#B89970]/60" />
              <div className="sf-orbit sf-orbit-three absolute inset-[28%] rounded-full border border-[#B89970]/50" />

              <div className="sf-orbit-dot absolute inset-[7%] rounded-full">
                <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-[#B89970] shadow-[0_0_25px_#B89970]" />
              </div>

              <div className="sf-camera relative z-10 flex h-[220px] w-[220px] items-center justify-center rounded-[35px] border border-[#B89970]/70 bg-gradient-to-br from-[#E8DDCE] via-[#B89970] to-[#806447] shadow-[0_15px_70px_rgba(184,153,112,0.25)] sm:h-[280px] sm:w-[280px]">

                <div className="absolute inset-3 rounded-[28px] border border-white/50" />

                <div className="sf-lens relative flex h-36 w-36 items-center justify-center rounded-full border-[7px] border-[#806447] bg-gradient-to-br from-[#E8DDCE] via-[#B89970] to-[#292522] sm:h-44 sm:w-44">

                  <div className="absolute inset-3 rounded-full border border-white/50" />
                  <div className="absolute inset-7 rounded-full border border-white/30" />

                  <div className="sf-lens-center flex h-20 w-20 items-center justify-center rounded-full border border-white/50 bg-gradient-to-br from-[#B89970] via-[#40372D] to-black sm:h-24 sm:w-24">
                    <span className="text-3xl text-[#F5F0E8] sm:text-4xl">✦</span>
                  </div>

                  <span className="absolute left-4 top-8 h-3 w-3 rounded-full bg-white/80 blur-[2px]" />
                </div>

                <span className="absolute bottom-5 font-serif text-[10px] uppercase tracking-[0.35em] text-[#292522]">
                  STUDIOFRAME
                </span>

              </div>

              <div className="sf-float-one absolute right-0 top-[17%] rounded-xl border border-[#B89970]/50 bg-[#F5F0E8]/95 px-5 py-4 shadow-xl backdrop-blur-xl">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#806447]">Creative Vision</span>
                <p className="mt-1 font-serif text-sm italic text-[#292522]">Beyond Ordinary</p>
              </div>

              <div className="sf-float-two absolute bottom-[17%] left-0 rounded-xl border border-[#B89970]/50 bg-[#F5F0E8]/95 px-5 py-4 shadow-xl backdrop-blur-xl">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#806447]">Every Frame</span>
                <p className="mt-1 font-serif text-sm italic text-[#292522]">A Timeless Story</p>
              </div>

            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#B89970] to-transparent" />
      </section>

      {/* CATEGORY MARQUEE */}
      <section className="relative z-10 overflow-hidden border-y border-[#B89970]/30 bg-[var(--color-paper)] py-6 sm:py-8">

        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[var(--color-paper)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[var(--color-paper)] to-transparent" />

        <div className="sf-marquee flex w-max">
          {[0, 1, 2, 3].map((group) => (
            <div key={group} className="flex shrink-0 items-center gap-9 pr-9 sm:gap-14 sm:pr-14">
              {categories.map((category, index) => (
                <div key={category} className="flex items-center gap-8 sm:gap-12">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] tracking-[0.25em] text-[#806447]">0{index + 1}</span>
                    <span className="whitespace-nowrap font-serif text-2xl italic text-[#292522] sm:text-3xl">{category}</span>
                  </div>
                  <span className="h-2.5 w-2.5 rotate-45 border border-[#B89970] bg-[#B89970]/20" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES INTRO */}
      <section
        id="services"
        className="relative z-10 mx-auto max-w-[1500px] bg-[var(--color-paper)] px-5 pb-5 pt-16 sm:px-10 lg:px-16"
      >

        <div className="flex flex-col justify-between gap-6 border-b border-[#B89970]/40 pb-8 sm:flex-row sm:items-end">

          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-9 bg-[#B89970]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#806447]">Discover Our Collection</span>
            </div>

            <h2 className="font-serif text-4xl leading-tight text-[#292522] sm:text-5xl lg:text-6xl">
              Our Signature
              <span className="ml-3 bg-gradient-to-r from-[#806447] to-[#B89970] bg-clip-text italic text-transparent">Services.</span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#62574C]">
              Every occasion deserves its own perspective. Explore our
              collection of photography experiences, thoughtfully created
              to capture the moments that matter.
            </p>
          </div>

          <div className="flex items-center gap-4 sm:pb-1">
            <span className="font-serif text-5xl text-[#A78660]">{String(services.length + 1).padStart(2, "0")}</span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#292522]">Experiences</p>
              <p className="mt-1 text-[10px] text-[#806447]">Made for your moments</p>
            </div>
          </div>

        </div>
      </section>

      {/* SERVICE CARDS */}
      <section className="relative z-10 mx-auto max-w-[1500px] bg-[var(--color-paper)] px-5 pb-20 pt-12 sm:px-10 lg:px-16">

        <div className="sf-service-grid grid grid-cols-1 justify-items-center gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {/* EXISTING 7 CARDS - UNCHANGED */}
          {services.map((service, index) => (
            <div
              key={service.id}
              className="sf-service-item group relative w-full max-w-[290px]"
              style={{ animationDelay: `${index * 120}ms` }}
            >

              <div className="absolute -left-3 -top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#B89970] bg-[var(--color-paper)] shadow-md transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-12 group-hover:bg-[#B89970]">
                <span className="font-serif text-sm text-[#292522]">{String(index + 1).padStart(2, "0")}</span>
              </div>

              <div className="absolute -inset-2 rounded-2xl border border-[#B89970]/30 transition-all duration-500 group-hover:-inset-3 group-hover:border-[#B89970] group-hover:shadow-[0_10px_35px_rgba(184,153,112,0.15)]" />

              <div className="sf-card-content relative overflow-hidden rounded-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_45px_rgba(184,153,112,0.20)]">
                <ServiceCard service={service} />
              </div>

              <div className="mx-auto mt-5 h-[2px] w-10 bg-[#B89970] transition-all duration-500 group-hover:w-24" />

            </div>
          ))}

          {/* 8TH CARD - DRONE PHOTOGRAPHY */}
          <Link
            href="/enquiry"
            aria-label="Book Drone Photography"
            className="sf-service-item group relative block w-full max-w-[290px]"
            style={{ animationDelay: `${services.length * 120}ms` }}
          >

            {/* NUMBER BADGE */}
            <div className="absolute -left-3 -top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#B89970] bg-[var(--color-paper)] shadow-md transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-12 group-hover:bg-[#B89970]">
              <span className="font-serif text-sm text-[#292522]">08</span>
            </div>

            {/* OUTER BORDER */}
            <div className="absolute -inset-2 rounded-2xl border border-[#B89970]/30 transition-all duration-500 group-hover:-inset-3 group-hover:border-[#B89970] group-hover:shadow-[0_10px_35px_rgba(184,153,112,0.15)]" />

            {/* DARK CARD */}
            <div className="sf-card-content relative overflow-hidden rounded-xl bg-[#171717] transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_45px_rgba(184,153,112,0.20)]">

              {/* DRONE IMAGE */}
              <div
                className="relative h-[190px] overflow-hidden bg-cover bg-center"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom, rgba(23,23,23,0.05), rgba(23,23,23,0.85)), url('https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=900&q=85')",
                }}
              >
                <div className="absolute inset-0 bg-black/10 transition-all duration-500 group-hover:bg-transparent" />

                <span className="absolute bottom-4 left-5 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#D5B88F]">
                  Aerial Photography
                </span>

                <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#B89970]/60 bg-black/40 text-xl text-[#B89970] transition-all duration-500 group-hover:rotate-45 group-hover:scale-110">
                  ✦
                </span>
              </div>

              {/* CARD DETAILS */}
              <div className="px-5 pb-6 pt-5 text-[#F5F0E8]">

                <div className="mb-3 h-px w-10 bg-[#B89970]" />

                <h3 className="font-serif text-[23px] font-medium text-[#F5F0E8]">
                  Drone Photography
                </h3>

                <p className="mt-3 min-h-[60px] text-sm leading-7 text-[#C7C0B6]">
                  Capture breathtaking aerial views and unforgettable
                  perspectives from above with our professional drone
                  photography experience.
                </p>

                {/* FEATURES */}
                <div className="mt-4 space-y-3 text-xs text-[#D9D0C3]">
                  <p className="flex items-center gap-3">
                    <span className="text-[#B89970]">✧</span>
                    Aerial Coverage
                  </p>

                  <p className="flex items-center gap-3">
                    <span className="text-[#B89970]">✧</span>
                    Cinematic Aerial Views
                  </p>
                </div>

                {/* PRICE */}
                <div className="mt-6 border-t border-[#B89970]/30 pt-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#A99A86]">
                    Starting From
                  </p>

                  <p className="mt-2 font-serif text-3xl text-[#D1B48C]">
                    ₹1,500
                  </p>
                </div>

                {/* BOOK NOW */}
                <div className="mt-5 flex w-full items-center justify-between border border-[#B89970]/60 bg-[#B89970]/10 px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D1B48C] transition-all duration-300 group-hover:border-[#B89970] group-hover:bg-[#B89970] group-hover:text-[#171717]">
                  <span>Book Now</span>
                  <span className="text-base transition-transform duration-300 group-hover:translate-x-2">→</span>
                </div>

              </div>
            </div>

            {/* BOTTOM LINE */}
            <div className="mx-auto mt-5 h-[2px] w-10 bg-[#B89970] transition-all duration-500 group-hover:w-24" />

          </Link>

        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="relative z-10 overflow-hidden border-y border-[#B89970]/30 bg-[var(--color-paper)] px-5 py-16 sm:px-10 lg:px-16">

        <div className="mx-auto max-w-[1400px]">

          <div className="mb-12 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#806447]">The StudioFrame Difference</p>
            <h2 className="mt-3 font-serif text-3xl text-[#292522] sm:text-4xl">More Than Just Photography</h2>
            <div className="mx-auto mt-5 h-px w-20 bg-[#B89970]" />
          </div>

          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">

            {highlights.map((item) => (
              <div
                key={item.number}
                className="sf-highlight group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-[#B89970]/40 bg-[#E8DDCE]/50 px-3 py-8 text-center shadow-sm transition-all duration-500 hover:-translate-y-3 hover:border-[#B89970] hover:bg-[#E8DDCE] hover:shadow-[0_15px_40px_rgba(184,153,112,0.18)] sm:py-10"
              >
                <span className="text-3xl text-[#A78660] transition-all duration-500 group-hover:scale-125 group-hover:rotate-12">{item.icon}</span>
                <span className="mt-4 font-serif text-lg text-[#292522] sm:text-xl">{item.title}</span>
                <span className="mt-2 text-[9px] tracking-[0.3em] text-[#806447]">{item.number}</span>
                <span className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-[#B89970] transition-all duration-500 group-hover:w-2/3" />
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 overflow-hidden bg-[var(--color-paper)] px-5 py-20 sm:px-10 lg:px-16">

        <div className="sf-cta relative mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl border border-[#B89970]/50 bg-[#E8DDCE]/60 px-7 py-14 text-center sm:px-12 lg:flex-row lg:text-left">

          <div className="pointer-events-none absolute -right-20 -top-40 h-80 w-80 rounded-full bg-[#B89970]/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-[#B89970]/15 blur-[100px]" />

          <div className="relative z-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#806447]">Your story starts here</p>

            <h2 className="mt-4 font-serif text-3xl leading-tight text-[#292522] sm:text-4xl lg:text-5xl">
              Let's Create Something
              <br />
              <span className="italic text-[#A78660]">Extraordinary.</span>
            </h2>

            <p className="mt-4 text-sm text-[#62574C]">
              Beautiful moments deserve beautiful memories.
            </p>
          </div>

          <Link
            href="/enquiry"
            className="sf-cta-button group relative z-10 inline-flex shrink-0 items-center gap-4 rounded-full bg-[#B89970] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#171717] shadow-lg shadow-[#B89970]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#A78660] hover:shadow-xl"
          >
            Contact Our Studio
            <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
          </Link>

        </div>
      </section>

      {/* ANIMATIONS */}
      <style>{`

        .services-page {
          isolation: isolate;
          background: var(--color-paper);
          color: var(--studio-deep-charcoal);
        }

        .services-page .sf-grid {
          background-image:
            linear-gradient(rgba(184,153,112,.10) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,153,112,.10) 1px, transparent 1px);
          background-size: 65px 65px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
        }

        .services-page .sf-ambient {
          animation: sfAmbientOne 12s ease-in-out infinite alternate;
        }

        .services-page .sf-ambient-two {
          animation: sfAmbientTwo 15s ease-in-out infinite alternate;
        }

        .services-page .sf-beam {
          background: linear-gradient(to bottom, transparent, rgba(184,153,112,.45), transparent);
          animation: sfBeam 7s ease-in-out infinite alternate;
        }

        .services-page .sf-beam-two { animation-delay: 2s; }

        .services-page .sf-reveal {
          animation: sfReveal 1s cubic-bezier(.2,.7,.2,1) both;
        }

        .services-page .sf-reveal-left {
          animation: sfRevealLeft 1s cubic-bezier(.2,.7,.2,1) both;
        }

        .services-page .sf-delay-1 { animation-delay: .15s; }
        .services-page .sf-delay-2 { animation-delay: .3s; }
        .services-page .sf-delay-3 { animation-delay: .45s; }
        .services-page .sf-delay-4 { animation-delay: .6s; }

        .services-page .sf-orbit-one { animation: sfSpin 28s linear infinite; }
        .services-page .sf-orbit-two { animation: sfSpinReverse 22s linear infinite; }
        .services-page .sf-orbit-three { animation: sfSpin 18s linear infinite; }
        .services-page .sf-orbit-dot { animation: sfSpin 12s linear infinite; }

        .services-page .sf-camera { animation: sfCameraFloat 6s ease-in-out infinite; }
        .services-page .sf-lens { animation: sfLensGlow 4s ease-in-out infinite alternate; }
        .services-page .sf-lens-center { animation: sfLensPulse 5s ease-in-out infinite; }
        .services-page .sf-float-one { animation: sfFloatRight 5s ease-in-out infinite; }
        .services-page .sf-float-two { animation: sfFloatLeft 6s ease-in-out infinite; }
        .services-page .sf-glow { animation: sfGlowPulse 5s ease-in-out infinite alternate; }

        .services-page .sf-marquee { animation: sfMarquee 45s linear infinite; }
        .services-page .sf-marquee:hover { animation-play-state: paused; }

        .services-page .sf-service-grid { perspective: 1400px; }

        .services-page .sf-service-item {
          opacity: 0;
          animation: sfCardBottom 1s cubic-bezier(.2,.7,.2,1) forwards;
        }

        .services-page .sf-service-item:nth-child(3n + 1) { animation-name: sfCardLeft; }
        .services-page .sf-service-item:nth-child(3n + 2) { animation-name: sfCardBottom; }
        .services-page .sf-service-item:nth-child(3n) { animation-name: sfCardRight; }

        .services-page .sf-card-content { transform-style: preserve-3d; }

        .services-page .sf-highlight { animation: sfReveal .8s ease both; }

        .services-page .sf-button::before,
        .services-page .sf-cta-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 25%, rgba(255,255,255,.35) 50%, transparent 75%);
          transform: translateX(-120%);
          transition: transform .7s ease;
        }

        .services-page .sf-button:hover::before,
        .services-page .sf-cta-button:hover::before {
          transform: translateX(120%);
        }

        .services-page .sf-cta { animation: sfPanelGlow 6s ease-in-out infinite alternate; }

        @keyframes sfReveal {
          from { opacity: 0; transform: translateY(45px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes sfRevealLeft {
          from { opacity: 0; transform: translateX(-65px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes sfCardLeft {
          from { opacity: 0; transform: translateX(-55px) rotateY(10deg) scale(.94); }
          to { opacity: 1; transform: translateX(0) rotateY(0) scale(1); }
        }

        @keyframes sfCardBottom {
          from { opacity: 0; transform: translateY(60px) scale(.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes sfCardRight {
          from { opacity: 0; transform: translateX(55px) rotateY(-10deg) scale(.94); }
          to { opacity: 1; transform: translateX(0) rotateY(0) scale(1); }
        }

        @keyframes sfAmbientOne {
          from { transform: translate3d(-30px,-20px,0) scale(.9); }
          to { transform: translate3d(70px,60px,0) scale(1.2); }
        }

        @keyframes sfAmbientTwo {
          from { transform: translate3d(30px,30px,0) scale(1); }
          to { transform: translate3d(-70px,-50px,0) scale(1.2); }
        }

        @keyframes sfBeam {
          from { opacity: .2; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(30px); }
        }

        @keyframes sfSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes sfSpinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes sfCameraFloat {
          0%,100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-16px) rotate(2deg); }
        }

        @keyframes sfLensGlow {
          from { box-shadow: 0 0 20px rgba(184,153,112,.15); }
          to { box-shadow: 0 0 60px rgba(184,153,112,.45); }
        }

        @keyframes sfLensPulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        @keyframes sfFloatRight {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(12px,-16px); }
        }

        @keyframes sfFloatLeft {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(-12px,14px); }
        }

        @keyframes sfGlowPulse {
          from { opacity: .4; transform: scale(.9); }
          to { opacity: 1; transform: scale(1.15); }
        }

        @keyframes sfMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes sfPanelGlow {
          from { box-shadow: 0 0 20px rgba(184,153,112,.05); }
          to { box-shadow: 0 0 55px rgba(184,153,112,.2); }
        }

        @media (max-width: 640px) {
          .services-page .sf-hero { min-height: auto; }
          .services-page .sf-visual { max-width: 370px; }
          .services-page .sf-float-one { right: -3px; }
          .services-page .sf-float-two { left: -3px; }
          .services-page .sf-service-item { animation-name: sfCardBottom; }
        }

        @media (prefers-reduced-motion: reduce) {
          .services-page *,
          .services-page *::before,
          .services-page *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }

          .services-page .sf-service-item { opacity: 1; }
        }

      `}</style>

    </main>
  );
}