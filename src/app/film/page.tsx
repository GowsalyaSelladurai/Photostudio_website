import type { Metadata } from "next";
import Image from "next/image";
import { AutoVideoBanner } from "@/components/film/auto-video-banner";
import { HeroStoryText } from "@/components/film/hero-story-text";
import { FilmCategoryExplorer } from "@/components/film/film-category-explorer";
import { ReferenceVideoCard } from "@/components/film/reference-video-card";
import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { filmContent, referenceVideos } from "@/config/film.config";

export const metadata: Metadata = {
  title: "Film",
  description:
    "Photography and cinematic film: watch featured videos and reference films from the StudioFrame demo studio.",
};

export default function FilmPage() {
  const { introduction, pillars, approach, references, closing } = filmContent;

  return (
    <>
      <AutoVideoBanner />
      <HeroStoryText />
      <FilmCategoryExplorer />

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              eyebrow={introduction.eyebrow}
              title={introduction.title}
            />
            <div className="mt-5 space-y-4 text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              {introduction.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/booking">Book a session</ButtonLink>
              <ButtonLink href="/services" variant="outline">
                View services
              </ButtonLink>
            </div>
          </div>
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl bg-[var(--color-sand)] sm:min-h-[460px]">
            <Image
              src={introduction.image}
              alt={introduction.imageAlt}
              fill
              sizes="(max-width: 1024px) 90vw, 55vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-sand)] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={pillars.eyebrow}
            title={pillars.title}
            description={pillars.description}
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {pillars.items.map((item, index) => (
              <article
                key={item.title}
                className="premium-card rounded-2xl p-6"
              >
                <p className="font-serif text-4xl text-[var(--studio-champagne-gold)]">
                  0{index + 1}
                </p>
                <h3 className="mt-4 font-serif text-2xl text-[var(--color-ink)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          eyebrow={approach.eyebrow}
          title={approach.title}
          description={approach.description}
        />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {approach.steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-[var(--color-line)] p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">
                Step {index + 1}
              </p>
              <h3 className="mt-3 font-serif text-2xl text-[var(--color-ink)]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-[var(--color-paper-deep)] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={references.eyebrow}
            title={references.title}
            description={references.description}
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {referenceVideos.map((video) => (
              <ReferenceVideoCard
                key={video.id}
                video={video}
                watchLabel={references.watchLabel}
              />
            ))}
          </div>
          <p className="mt-8 text-xs leading-5 text-[var(--color-muted)]">
            {references.note}
          </p>
        </div>
      </section>

      <section className="bg-[var(--studio-deep-charcoal)] px-5 py-20 text-center text-[var(--studio-ivory-white)] sm:px-8 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
          {closing.eyebrow}
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
          {closing.title}
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/booking" variant="light">
            {closing.linkLabel}
          </ButtonLink>
          <ButtonLink
            href="/contact"
            variant="light"
            className="bg-transparent text-[var(--studio-midnight-black)] ring-1 ring-[var(--studio-champagne-gold)] hover:bg-[var(--studio-champagne-gold)] hover:text-[var(--studio-midnight-black)]"
          >
            {closing.secondaryLabel}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
