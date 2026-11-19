
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const storyPhotos = [
  {
    id: "tamil-wedding",
    image: "https://camouflageclicks.com/assets/uploads/blog/5481355.png",
    alt: "Traditional Tamil wedding with flower garlands and sacred rituals",
    caption: "The beauty of traditions",
    location: "TAMIL NADU",
  },
  {
    id: "kerala-wedding",
    image: "https://images-pw.pixieset.com/page/ZRqPA3/SRN_6681_1-ebb6546e-1500.jpg",
    alt: "Traditional Kerala wedding ceremony",
    caption: "Moments of togetherness",
    location: "KERALA",
  },
  {
    id: "bridal-portrait",
    image: "https://images.squarespace-cdn.com/content/v1/64098fbbd21dd971ed1f5028/1706776879489-OSKGW8AJVCJFHYSMG32C/Rinas-Venue-wedding-21.jpg",
    alt: "South Indian bride in traditional silk saree",
    caption: "Elegance in every detail",
    location: "BRIDAL STORIES",
  },
  {
    id: "wedding-candid",
    image: "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/f6c1ac210310467.670f13ab86ce1.jpg",
    alt: "Candid South Indian wedding ceremony",
    caption: "Unscripted emotions",
    location: "CANDID MOMENTS",
  },
  {
    id: "temple-wedding",
    image: "https://images.squarespace-cdn.com/content/v1/6564afb4f0851760cfcdde58/2a0fd423-6465-46ff-8777-ef8dbefd3608/Leela-Supra-0391.jpg",
    alt: "Traditional Tamil temple wedding ceremony",
    caption: "Rooted in tradition",
    location: "CHENNAI",
  },
  {
    id: "wedding-celebration",
    image: "https://cdn0.weddingwire.in/vendor/2286/3_2/1280/jpeg/wedding-photographers-mercury-studios-bride_15_422286-166246012175232.jpeg",
    alt: "South Indian bride celebrating her wedding",
    caption: "A celebration of love",
    location: "SOUTH INDIA",
  },
];

export function StorySlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % storyPhotos.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const currentPhoto = storyPhotos[active];

  return (
    <section className="relative overflow-hidden bg-[#F5F0E8] px-5 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-7 flex items-center justify-between border-b border-[#B89970]/40 pb-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#98704d]">
            StudioFrame / Our Story
          </p>

          <span className="font-serif text-xs italic text-[#292522]/55">
            Est. StudioFrame
          </span>
        </div>

        <div className="grid items-center gap-7 md:grid-cols-[0.8fr_1.2fr] md:gap-12">

          {/* LEFT CONTENT */}
          <div className="order-2 md:order-1">

            <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#B89970]">
              A perspective beyond the lens
            </p>

            <h1 className="font-serif text-4xl leading-[1.12] tracking-tight text-[#292522] sm:text-5xl lg:text-[58px]">
              Stories
              <br />
              are meant
              <br />
              to be{" "}
              <span className="italic text-[#B89970]">
                felt.
              </span>
            </h1>

            <div className="my-5 h-px w-12 bg-[#B89970]" />

            <p className="max-w-sm text-xs leading-7 text-[#292522]/65 sm:text-sm">
              We look beyond the perfect pose, finding beauty
              in little details, honest emotions and moments
              that deserve to stay.
            </p>

            {/* ACTIVE STORY */}
            <div className="mt-7 flex items-center gap-3">
              <span className="font-serif text-2xl italic text-[#B89970]">
                0{active + 1}
              </span>

              <span className="h-px w-10 bg-[#B89970]/50" />

              <span className="text-[9px] uppercase tracking-[0.25em] text-[#292522]/55">
                {currentPhoto.location}
              </span>
            </div>

          </div>

          {/* RIGHT IMAGE SLIDER */}
          <div className="order-1 md:order-2 min-w-0">

            <div className="relative mx-auto aspect-[5/4] w-full max-w-[560px] overflow-hidden rounded-sm bg-[#DED1BE] shadow-xl shadow-[#292522]/10">

              {storyPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    active === index
                      ? "opacity-100"
                      : "pointer-events-none opacity-0"
                  }`}
                >
                  <Image
                    src={photo.image}
                    alt={photo.alt}
                    fill
                    unoptimized
                    priority={index === 0}
                    sizes="(max-width: 768px) 90vw, 560px"
                    className="object-cover"
                  />
                </div>
              ))}

              {/* IMAGE CAPTION */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-5 pb-5 pt-16">

                <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/70">
                  0{active + 1} / 06
                </p>

                <h3 className="mt-1 font-serif text-xl italic text-white sm:text-2xl">
                  {currentPhoto.caption}
                </h3>

              </div>

              {/* GOLD FRAME DETAIL */}
              <div className="pointer-events-none absolute inset-3 border border-white/25" />

            </div>

            {/* NUMBER NAVIGATION */}
            <div className="mx-auto mt-4 flex max-w-[560px] items-center justify-between border-b border-[#B89970]/40 pb-3">

              <div className="flex items-center gap-4 sm:gap-6">
                {storyPhotos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setActive(index)}
                    aria-label={`Show story ${index + 1}: ${photo.location}`}
                    aria-pressed={active === index}
                    className={`font-serif text-sm transition-all duration-300 ${
                      active === index
                        ? "scale-125 text-[#98704d]"
                        : "text-[#292522]/35 hover:text-[#B89970]"
                    }`}
                  >
                    0{index + 1}
                  </button>
                ))}
              </div>

              <span className="hidden text-[9px] uppercase tracking-[0.2em] text-[#292522]/45 sm:block">
                Visual Stories
              </span>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
