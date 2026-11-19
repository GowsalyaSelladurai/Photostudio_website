
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
    "Discover the philosophy, people, and creative approach behind StudioFrame.",
};

export default function AboutPage() {
  const { about } = studioConfig;

  return (
    <main className="overflow-hidden bg-[#f2eee8]">

      {/* AUTOMATIC PHOTO SLIDER */}
      <StorySlider />

      {/* OUR STORY */}
      <section
        id="our-story"
        className="bg-[#f2eee8] px-5 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-5xl">

          <div className="mb-9 flex items-center justify-between border-b border-[#c9bba9] pb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#98704d]">
              A story behind every frame
            </p>
            <span className="font-serif text-sm italic text-[#98704d]">
              StudioFrame — 01
            </span>
          </div>

          <div className="grid items-center gap-9 md:grid-cols-2 md:gap-12">

            {/* STORY IMAGE */}
            <div className="relative mx-auto w-full max-w-[390px]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-t-[130px] bg-[#ded2c3]">
                <Image
                  src={about.story.image}
                  alt={about.story.imageAlt}
                  fill
                  sizes="(max-width: 768px) 90vw, 390px"
                  className="object-cover transition duration-700 hover:scale-105"
                />
              </div>

              <div className="absolute -bottom-5 right-3 rounded-full border border-[#c5a47e] bg-[#f2eee8] px-5 py-3">
                <p className="font-serif text-xl italic text-[#98704d]">
                  Moments
                </p>
                <p className="text-[8px] uppercase tracking-[0.2em] text-[#6f6258]">
                  Made to remember
                </p>
              </div>
            </div>

            {/* STORY TEXT */}
            <div className="py-5 md:pl-3">

              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#98704d]">
                {about.story.eyebrow}
              </p>

              <h2 className="font-serif text-3xl leading-tight text-[#29251f] sm:text-4xl">
                {about.story.title}
              </h2>

              <div className="my-6 h-px w-14 bg-[#98704d]" />

              <div className="space-y-4">
                {about.story.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-7 text-[#746b62]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 border-l-2 border-[#98704d] pl-5">
                <p className="font-serif text-xl italic leading-relaxed text-[#98704d]">
                  Photographs that feel like home.
                </p>
              </div>

              <p className="mt-7 text-[9px] uppercase tracking-[0.25em] text-[#9b9187]">
                Every frame tells a story.
              </p>

            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="relative overflow-hidden bg-[#211e1b] px-5 py-16 text-[#f2eee8] sm:py-20">

        <div className="pointer-events-none absolute -right-5 top-0 font-serif text-[200px] leading-none text-white/[0.025]">
          “
        </div>

        <div className="relative mx-auto max-w-5xl">

          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c5a47e]">
              Our Philosophy
            </p>
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">
              The way we see things — 02
            </span>
          </div>

          <div className="grid gap-9 py-14 md:grid-cols-[1.15fr_0.85fr] md:items-end">

            <div>
              <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-[#c5a47e]">
                What we believe
              </p>

              <h2 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
                Beautiful photographs
                <span className="block italic text-[#c5a47e]">
                  begin with
                </span>
                real feelings.
              </h2>
            </div>

            <div className="max-w-sm">
              <p className="text-sm leading-7 text-white/60">
                The most meaningful photographs are never just about how
                something looks. They are about how it felt to be there.
                We make space for genuine connections, quiet gestures,
                and moments worth remembering.
              </p>

              <div className="mt-7 h-px w-14 bg-[#c5a47e]" />

              <p className="mt-5 font-serif text-lg italic text-[#c5a47e]">
                Less posing. More feeling.
              </p>
            </div>

          </div>

          <div className="grid border-t border-white/15 sm:grid-cols-3">

            <div className="border-b border-white/15 py-7 sm:border-b-0 sm:border-r sm:pr-6">
              <span className="font-serif text-3xl italic text-[#c5a47e]">01</span>
              <h3 className="mt-4 font-serif text-xl">Be present</h3>
              <p className="mt-3 text-xs leading-6 text-white/55">
                Enjoy the moment instead of worrying about the perfect pose.
              </p>
            </div>

            <div className="border-b border-white/15 py-7 sm:border-b-0 sm:border-r sm:px-6">
              <span className="font-serif text-3xl italic text-[#c5a47e]">02</span>
              <h3 className="mt-4 font-serif text-xl">Stay authentic</h3>
              <p className="mt-3 text-xs leading-6 text-white/55">
                Let natural expressions and real connections tell the story.
              </p>
            </div>

            <div className="py-7 sm:pl-6">
              <span className="font-serif text-3xl italic text-[#c5a47e]">03</span>
              <h3 className="mt-4 font-serif text-xl">Keep memories</h3>
              <p className="mt-3 text-xs leading-6 text-white/55">
                Create photographs that remain meaningful long after the moment.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="bg-[#eae3d9] px-5 py-16 sm:py-20">

        <div className="mx-auto max-w-5xl">

          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#98704d]">
                {about.team.eyebrow}
              </p>

              <h2 className="max-w-xl font-serif text-3xl leading-tight text-[#29251f] sm:text-4xl">
                {about.team.title}
              </h2>
            </div>

            <p className="max-w-xs text-xs leading-6 text-[#746b62]">
              {about.team.description}
            </p>

          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

            {about.team.members.map((member, index) => (
              <article key={member.name} className="group">

                <div className="relative aspect-[4/4.5] overflow-hidden rounded-xl bg-[#d8c9b5]">

                  <Image
                    src={member.image}
                    alt={member.imageAlt}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 300px"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />

                  <span className="absolute left-3 top-3 rounded-full bg-[#211e1b]/80 px-3 py-1.5 text-[10px] text-white">
                    0{index + 1}
                  </span>

                </div>

                <div className="pt-4">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#98704d]">
                    {member.role}
                  </p>

                  <h3 className="mt-2 font-serif text-xl text-[#29251f]">
                    {member.name}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-[#746b62]">
                    {member.description}
                  </p>

                </div>

              </article>
            ))}

          </div>
        </div>
      </section>

      {/* VISIT STUDIO */}
      <section className="bg-[#f2eee8] px-5 py-16 sm:py-20">

        <div className="mx-auto max-w-5xl">

          <div className="mb-9 max-w-xl">

            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#98704d]">
              {about.visit.eyebrow}
            </p>

            <h2 className="font-serif text-3xl text-[#29251f] sm:text-4xl">
              {about.visit.title}
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#746b62]">
              {about.visit.description}
            </p>

          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <StudioContactPanel />
            <GoogleMapsPlaceholder />
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#211e1b] px-5 py-16 text-center text-white sm:py-20">

        <div className="mx-auto max-w-2xl">

          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c5a47e]">
            {about.contactEyebrow}
          </p>

          <h2 className="mt-5 font-serif text-3xl leading-tight sm:text-5xl">
            {about.contactTitle}
          </h2>

          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/60">
            Every meaningful story starts with a conversation.
            Tell us what you have in mind.
          </p>

          <ButtonLink href="/contact" className="mt-8">
            {about.contactLinkLabel}
          </ButtonLink>

        </div>
      </section>

    </main>
  );
}
