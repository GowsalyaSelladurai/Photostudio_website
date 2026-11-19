import Image from "next/image";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";
import {
  GoogleMapsPlaceholder,
  StudioContactPanel,
} from "@/components/contact/studio-contact-panel";
import { studioConfig } from "@/config/studio.config";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  const { about } = studioConfig;

  return (
    <>
      <section className="bg-[var(--color-sand)] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={about.introduction.eyebrow}
            title={about.introduction.title}
            description={about.introduction.description}
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-[var(--color-sand)] sm:min-h-[520px]">
          <Image
            src={about.story.image}
            alt={about.story.imageAlt}
            fill
            sizes="(max-width: 1024px) 90vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <SectionHeading
            eyebrow={about.story.eyebrow}
            title={about.story.title}
          />
          {about.story.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="mt-5 text-base leading-7 text-[var(--color-muted)]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="bg-[var(--color-sand)] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={about.approach.eyebrow}
            title={about.approach.title}
            description={about.approach.description}
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {about.approach.principles.map((principle, index) => (
              <article
                key={principle.title}
                className="premium-card rounded-2xl p-6 sm:p-7"
              >
                <p className="font-serif text-2xl text-[var(--color-clay)]">
                  0{index + 1}
                </p>
                <h3 className="mt-5 font-serif text-2xl text-[var(--color-ink)]">
                  {principle.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                  {principle.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow={about.team.eyebrow}
          title={about.team.title}
          description={about.team.description}
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {about.team.members.map((member) => (
            <article
              key={member.name}
              className="premium-card overflow-hidden rounded-3xl"
            >
              <div className="relative aspect-[4/5] bg-[var(--color-sand)]">
                <Image
                  src={member.image}
                  alt={member.imageAlt}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-clay)]">
                  {member.role}
                </p>
                <h3 className="mt-2 font-serif text-2xl text-[var(--color-ink)]">
                  {member.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                  {member.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[var(--color-paper-deep)] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={about.visit.eyebrow}
            title={about.visit.title}
            description={about.visit.description}
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <StudioContactPanel />
            <GoogleMapsPlaceholder />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 text-center sm:px-8 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">
          {studioConfig.about.contactEyebrow}
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl font-serif text-4xl text-[var(--color-ink)] sm:text-5xl">
          {studioConfig.about.contactTitle}
        </h2>
        <ButtonLink href="/contact" className="mt-7">
          {studioConfig.about.contactLinkLabel}
        </ButtonLink>
      </section>
    </>
  );
}
