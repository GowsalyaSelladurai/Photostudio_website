
import Image from "next/image";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";
import { StorySlider } from "@/components/about/story-slider";
import {
  GoogleMapsPlaceholder,
  StudioContactPanel,
} from "@/components/contact/studio-contact-panel";
import { studioConfig } from "@/config/studio.config";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Discover the people, philosophy and creative vision behind StudioFrame.",
};

export default function AboutPage() {
  const { about } = studioConfig;

  return (
    <main className="overflow-hidden bg-[#171717]">

      {/* 01 - INTRO */}
      <StorySlider />

      {/* 02 - STORY */}
      <section className="bg-[#171717] px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-5xl">

          <div className="mb-6 flex items-center justify-between border-b border-white/15 pb-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#bd9b70]">
              The StudioFrame Story
            </p>
            <span className="font-serif text-xs italic text-white/40">
              Est. StudioFrame
            </span>
          </div>

          <div className="grid items-center gap-8 md:grid-cols-[220px_1fr] md:gap-12">

            <div className="relative mx-auto w-full max-w-[220px]">
              <div className="absolute -left-3 -top-3 h-full w-full border border-[#bd9b70]/50" />

              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={about.story.image}
                  alt={about.story.imageAlt}
                  fill
                  sizes="220px"
                  className="object-cover"
                />
              </div>

              <div className="absolute -bottom-3 -right-3 bg-[#bd9b70] px-4 py-2">
                <p className="font-serif text-xs italic text-[#171717]">
                  Made of memories
                </p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#bd9b70]">
                {about.story.eyebrow}
              </p>

              <h2 className="max-w-xl font-serif text-2xl leading-tight text-[#f3eee6] sm:text-3xl">
                Every frame carries a feeling.
                <span className="block italic text-[#bd9b70]">
                  Every story matters.
                </span>
              </h2>

              <div className="my-4 h-px w-10 bg-[#bd9b70]" />

              <div className="max-w-xl space-y-3">
                {about.story.paragraphs.slice(0, 2).map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-xs leading-6 text-white/55 sm:text-sm"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <p className="mt-5 font-serif text-sm italic text-[#bd9b70]">
                Photographs that feel like home.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 border-y border-white/15">
            {[
              { number: "01", title: "Be present", description: "Enjoy every moment." },
              { number: "02", title: "Stay real", description: "Keep every emotion natural." },
              { number: "03", title: "Make memories", description: "Create moments worth keeping." },
            ].map((item) => (
              <div
                key={item.number}
                className="border-r border-white/15 px-3 py-4 last:border-r-0 sm:px-6"
              >
                <span className="font-serif text-lg italic text-[#bd9b70]">
                  {item.number}
                </span>
                <h3 className="mt-1 font-serif text-xs text-white sm:text-sm">
                  {item.title}
                </h3>
                <p className="mt-1 text-[9px] leading-4 text-white/40 sm:text-[11px]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 - CREATIVE TEAM SECTION */}
      <section className="bg-[#eae3d9] px-5 py-7 sm:px-8 sm:py-9">
        <div className="mx-auto max-w-6xl">

          {/* COMPACT HEADER */}
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">

            <div>
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#98704d]">
                {about.team.eyebrow}
              </p>

              <h2 className="font-serif text-2xl text-[#29251f] sm:text-3xl">
                The people behind every frame.
              </h2>
            </div>

            <p className="max-w-xs text-[11px] leading-5 text-[#746b62]">
              {about.team.description}
            </p>
          </div>

          {/* FOUR COLUMN EDITORIAL GRID */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {about.team.members.slice(0, 3).map((member, index) => (
              <article key={member.name} className="group min-w-0">

                <div className="relative aspect-[4/4.7] overflow-hidden bg-[#d8c9b5]">

                  <Image
                    src={member.image}
                    alt={member.imageAlt}
                    fill
                    sizes="(max-width: 640px) 45vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <span className="absolute left-2 top-2 bg-[#171717]/75 px-3 py-1.5 text-[9px] tracking-wider text-white">
                    0{index + 1}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 pt-10">
                    <p className="text-[8px] uppercase tracking-[0.2em] text-white/80">
                      {member.role}
                    </p>
                  </div>
                </div>

                <div className="border-b border-[#b9aa98] pb-2 pt-2">
                  <h3 className="font-serif text-base text-[#29251f] sm:text-lg">
                    {member.name}
                  </h3>

                  <p className="mt-1 text-[10px] leading-4 text-[#746b62]">
                    {member.description}
                  </p>
                </div>

              </article>
            ))}

            {/* CREATIVE FOURTH PANEL */}
            <div className="relative flex min-h-[220px] flex-col justify-between overflow-hidden border border-[#bd9b70]/50 bg-[#29251f] p-4 sm:p-5">

              <span className="absolute -right-5 -top-8 font-serif text-[130px] italic leading-none text-white/[0.045]">
                SF
              </span>

              <div className="relative">
                <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#bd9b70]">
                  Our creative identity
                </p>

                <h3 className="mt-5 font-serif text-2xl leading-tight text-[#f3eee6] sm:text-3xl">
                  Three minds.
                  <span className="block italic text-[#bd9b70]">
                    One vision.
                  </span>
                </h3>
              </div>

              <div className="relative">
                <div className="mb-3 h-px w-10 bg-[#bd9b70]" />

                <p className="text-[10px] leading-5 text-white/55">
                  Every photograph begins with a perspective and becomes a memory worth keeping.
                </p>

                <p className="mt-4 font-serif text-xs italic text-[#bd9b70]">
                  Beyond the ordinary.
                </p>
              </div>

            </div>

          </div>

          {/* BOTTOM CREATIVE STRIP */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#b9aa98] pt-3">

            <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#98704d]">
              The StudioFrame Collective
            </p>

            <div className="flex items-center gap-3 font-serif text-xs italic text-[#746b62]">
              <span>Light</span>
              <span className="text-[#bd9b70]">✦</span>
              <span>Emotion</span>
              <span className="text-[#bd9b70]">✦</span>
              <span>Stories</span>
            </div>

          </div>

        </div>
      </section>

      {/* 04 - VISIT AND CONTACT */}
      <section className="bg-[#211e1b] px-5 py-9 sm:px-8 sm:py-11">
        <div className="mx-auto max-w-6xl">

          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#bd9b70]">
                {about.visit.eyebrow}
              </p>

              <h2 className="font-serif text-3xl text-[#f3eee6] sm:text-4xl">
                {about.visit.title}
              </h2>
            </div>

            <p className="max-w-xs text-xs leading-6 text-white/45">
              {about.visit.description}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <StudioContactPanel />
            <GoogleMapsPlaceholder />
          </div>
        </div>
      </section>

      {/* 05 - FINAL CTA */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#171717] px-5 py-10 text-center sm:py-14">

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-[130px] font-bold text-white/[0.025] sm:text-[200px]">
            SF
          </span>
        </div>

        <div className="relative mx-auto max-w-2xl">

          <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#bd9b70]">
            {about.contactEyebrow}
          </p>

          <h2 className="mt-3 font-serif text-3xl leading-tight text-[#f3eee6] sm:text-5xl">
            {about.contactTitle}
          </h2>

          <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-white/45">
            Every meaningful story starts with a conversation.
            Tell us what you have in mind.
          </p>

          <ButtonLink href="/contact" className="mt-6">
            {about.contactLinkLabel}
          </ButtonLink>

        </div>
      </section>

    </main>
  );
}