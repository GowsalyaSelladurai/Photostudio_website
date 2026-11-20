import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { destinations, getDestination } from "@/data/journeys";

type JourneyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return destinations.map((destination) => ({
    slug: destination.slug,
  }));
}

export async function generateMetadata({ params }: JourneyPageProps) {
  const { slug } = await params;
  const destination = getDestination(slug);

  return {
    title: destination
      ? `${destination.name} Photography | StudioFrame`
      : "Location Not Found",
    description: destination?.shortDescription,
  };
}

export default async function JourneyPage({
  params,
}: JourneyPageProps) {
  const { slug } = await params;
  const destination = getDestination(slug);

  if (!destination) {
    notFound();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-sand)] text-[var(--studio-deep-charcoal)]">

      {/* ================= HERO BANNER ================= */}
      <section className="relative mx-6 mt-7 min-h-[390px] overflow-hidden rounded-2xl sm:mx-8 sm:min-h-[470px] lg:mx-12 lg:min-h-[540px]">

        <div className="absolute inset-0 animate-banner-image">
          <Image
            src={destination.coverImage}
            alt={`${destination.name} wedding photography`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/10" />

        <div className="relative z-10 mx-auto flex min-h-[390px] max-w-7xl items-center px-6 py-16 sm:min-h-[470px] sm:px-10 lg:min-h-[540px]">

          <div className="max-w-2xl animate-banner-content">

            <Link
              href="/#journeys"
              className="group mb-7 inline-flex items-center gap-3 text-sm text-white/90 transition-colors hover:text-[#e8c994]"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              Back to Home
            </Link>

            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f2d49b]">
              Wedding & Event Photography
            </p>

            <h1 className="mt-4 font-serif text-5xl leading-[1.1] text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
              {destination.name}
              <span className="text-[#e8c994]">.</span>
            </h1>

            <div className="mt-4 h-px w-20 bg-[#e8c994]" />

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/95 sm:text-base">
              {destination.shortDescription}
            </p>

            <p className="mt-4 flex items-center gap-3 text-sm text-[#f2d49b]">
              <span>✦</span>
              {destination.location}
            </p>

            <Link
              href="/booking"
              className="mt-6 inline-flex items-center gap-4 rounded-full bg-[var(--studio-champagne-gold)] px-7 py-3 text-sm font-semibold text-[var(--studio-deep-charcoal)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              Book Your Photography
              <span>↗</span>
            </Link>

          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-white/20">
          <div className="h-full w-1/3 animate-banner-line bg-[var(--studio-champagne-gold)]" />
        </div>

      </section>


      {/* ================= INTRODUCTION ================= */}
      <section className="mx-auto max-w-7xl px-6 py-5 sm:px-10 lg:py-6">

        <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">

          {/* Left Heading Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[#d8c3a5] bg-[#eee3d4]/70 px-6 py-7 shadow-[0_8px_25px_rgba(65,45,25,0.09)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(65,45,25,0.13)] sm:px-8 sm:py-8">

            {/* Decorative Top Line */}
            <div className="absolute left-0 top-0 h-[2px] w-20 bg-[var(--studio-champagne-gold)]" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-clay)]">
              Our Photography Stories
            </p>

            <h2 className="mt-3 max-w-xl font-serif text-4xl leading-[1.12] text-[#30251f] drop-shadow-[0_2px_2px_rgba(80,55,35,0.12)] sm:text-5xl lg:text-[54px]">
              Moments captured.
              <span className="mt-1 block italic text-[var(--color-clay)]">
                Memories preserved.
              </span>
            </h2>

            {/* Decorative Bottom Detail */}
            <div className="mt-5 flex items-center gap-3">
              <div className="h-px w-10 bg-[var(--studio-champagne-gold)]" />
              <span className="text-xs text-[var(--color-clay)]">✦</span>
              <div className="h-px w-10 bg-[var(--studio-champagne-gold)]" />
            </div>

          </div>

          {/* Right Description */}
          <div className="max-w-xl lg:justify-self-end">

            <div className="mb-4 h-px w-12 bg-[var(--studio-champagne-gold)]" />

            <p className="text-sm leading-7 text-[var(--color-muted)] sm:text-base">
              {destination.description}
            </p>

            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--studio-deep-charcoal)]">
              {destination.location}
            </p>

          </div>

        </div>

      </section>


      {/* ================= GALLERY ================= */}
      <section className="bg-[var(--color-paper-deep)] py-6 sm:py-7">

        <div className="mx-auto max-w-7xl px-6 sm:px-10">

          {/* Gallery Header */}
          <div className="mb-5 flex flex-col gap-4 border-b border-[var(--color-line)] pb-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-clay)]">
                The Art of Memories
              </p>

              <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                Stories from {destination.name}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)]">
                A collection of weddings, celebrations and beautiful moments
                captured in {destination.name}.
              </p>

            </div>

            {/* Photograph Count */}
            <div className="flex shrink-0 items-center gap-4 sm:pb-1">

              <div className="text-right">

                <p className="font-serif text-4xl leading-none text-[var(--color-clay)]">
                  {String(destination.gallery.length).padStart(2, "0")}
                </p>

                <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  Photographs
                </p>

              </div>

              <div className="h-11 w-px bg-[var(--color-line)]" />

              <span className="text-2xl text-[var(--studio-champagne-gold)]">
                ✦
              </span>

            </div>

          </div>


          {/* Gallery Images */}
          {destination.gallery.length > 0 ? (

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {destination.gallery.map((image, index) => (

                <div
                  key={image}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-sand)] shadow-[0_8px_25px_rgba(30,25,20,0.06)]"
                >

                  <Image
                    src={image}
                    alt={`${destination.name} event photograph ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="absolute bottom-4 left-5 flex translate-y-2 items-center gap-3 text-sm text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">

                    <span className="h-px w-6 bg-[var(--studio-champagne-gold)]" />

                    {destination.name} · {String(index + 1).padStart(2, "0")}

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-[var(--color-line)] bg-[var(--color-sand)] px-6 text-center">

              <span className="text-3xl text-[var(--studio-champagne-gold)]">
                ✦
              </span>

              <h3 className="mt-3 font-serif text-2xl">
                Photographs coming soon
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-muted)]">
                We are preparing our beautiful event photography
                collection from {destination.name}.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* ================= BOOKING CTA ================= */}
      <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:py-9">

        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-deep)] px-6 py-12 text-center shadow-[0_8px_25px_rgba(65,45,25,0.06)] sm:px-12 lg:py-16">

          <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[var(--studio-champagne-gold)] to-transparent" />

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-clay)]">
            Let Your Story Begin
          </p>

          <h2 className="mx-auto mt-3 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl lg:text-5xl">
            Every moment deserves to be remembered.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)]">
            Planning a wedding or special celebration in {destination.name}?
            Let StudioFrame capture your beautiful moments.
          </p>

          <Link
            href="/booking"
            className="mt-6 inline-flex items-center gap-4 rounded-full bg-[var(--studio-champagne-gold)] px-9 py-3 text-sm font-semibold text-[var(--studio-deep-charcoal)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            Enquire Now
            <span>↗</span>
          </Link>

        </div>

      </section>


      {/* ================= ANIMATIONS ================= */}
      <style>{`
        @keyframes bannerImageZoom {
          from {
            transform: scale(1.12);
          }
          to {
            transform: scale(1);
          }
        }

        @keyframes bannerContentReveal {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bannerLineReveal {
          from {
            width: 0%;
          }
          to {
            width: 33.333%;
          }
        }

        .animate-banner-image {
          animation: bannerImageZoom 1.8s cubic-bezier(0.2, 0.65, 0.3, 1) both;
        }

        .animate-banner-content {
          animation: bannerContentReveal 0.9s ease-out 0.2s both;
        }

        .animate-banner-line {
          animation: bannerLineReveal 1.4s ease-out 0.4s both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-banner-image,
          .animate-banner-content,
          .animate-banner-line {
            animation: none;
          }
        }
      `}</style>

    </main>
  );
}