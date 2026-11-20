
"use client";

import Image from "next/image";
import Link from "next/link";

type InstagramPost = {
  title: string;
  category: string;
  image: string;
};

const firstRow: InstagramPost[] = [
  {
    title: "A Beautiful Beginning",
    category: "Traditional Wedding",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=85",
  },
  {
    title: "Haldi Moments",
    category: "Haldi Ceremony",
    image:
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=85",
  },
  {
    title: "The Mehndi Celebration",
    category: "Mehndi",
    image:
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=85",
  },
  {
    title: "Forever Together",
    category: "Couple Portrait",
    image:
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=85",
  },
  {
    title: "A Mother's Love",
    category: "Maternity",
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=85",
  },
  {
    title: "Little Happiness",
    category: "Baby Photography",
    image:
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=85",
  },
];

const secondRow: InstagramPost[] = [
  {
    title: "A Royal Celebration",
    category: "Wedding Reception",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=85",
  },
  {
    title: "Love in Every Frame",
    category: "Pre Wedding",
    image:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=85",
  },
  {
    title: "Birthday Magic",
    category: "Birthday Celebration",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=85",
  },
  {
    title: "Family Forever",
    category: "Family Photography",
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=85",
  },
  {
    title: "Beautiful Traditions",
    category: "Engagement",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=85",
  },
  {
    title: "Sweet Little Memories",
    category: "Kids Photography",
    image:
      "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&q=85",
  },
];

function InstagramCard({ post }: { post: InstagramPost }) {
  return (
    <Link
      href="https://www.instagram.com/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View ${post.category} photography on Instagram`}
      className="group relative block h-[270px] w-[220px] shrink-0 rounded-2xl border border-[#B89970]/65 bg-[#292522] p-[5px] shadow-[0_5px_20px_rgba(184,153,112,0.10)] transition-all duration-500 hover:-translate-y-2 hover:border-[#B89970] hover:shadow-[0_12px_35px_rgba(184,153,112,0.28)] sm:h-[320px] sm:w-[260px]"
    >
      {/* Card image container */}
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#292522]">
        <Image
          src={post.image}
          alt={`${post.category} photography`}
          fill
          unoptimized
          sizes="260px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Dark image overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/95 via-[#171717]/20 to-[#171717]/5 opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Card content */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B89970]">
            {post.category}
          </p>

          <h3 className="font-serif text-xl leading-tight text-[#F5F0E8] sm:text-2xl">
            {post.title}
          </h3>

          <span className="mt-4 inline-block translate-y-2 text-[11px] font-medium tracking-wider text-[#E8DDCE] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            View on Instagram →
          </span>
        </div>

        {/* Inner golden border */}
        <div className="pointer-events-none absolute inset-0 rounded-xl border border-[#B89970]/30 transition-all duration-500 group-hover:border-[#B89970] group-hover:shadow-[inset_0_0_20px_rgba(184,153,112,0.20)]" />
      </div>
    </Link>
  );
}

function MovingRow({
  posts,
  direction,
}: {
  posts: InstagramPost[];
  direction: "left" | "right";
}) {
  const repeatedPosts = [...posts, ...posts];

  return (
    <div className="group/row flex w-full overflow-hidden">
      <div
        className={`flex w-max shrink-0 gap-6 px-3 ${
          direction === "left"
            ? "animate-instagram-left"
            : "animate-instagram-right"
        } group-hover/row:[animation-play-state:paused]`}
      >
        {repeatedPosts.map((post, index) => (
          <InstagramCard
            key={`${direction}-${post.title}-${index}`}
            post={post}
          />
        ))}
      </div>
    </div>
  );
}

export function InstagramPreview() {
  return (
    <section className="overflow-hidden bg-[#171717] py-20 sm:py-28">

      {/* Instagram Heading */}
      <div className="mx-auto mb-16 max-w-7xl px-6 text-center sm:px-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#B89970]">
          Follow Our Journey
        </p>

        <h2 className="font-serif text-4xl font-medium text-[#F5F0E8] sm:text-5xl md:text-6xl">
          Moments Beyond{" "}
          <span className="italic text-[#B89970]">Words</span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#E8DDCE]/70 sm:text-base">
          From beautiful South Indian wedding celebrations to precious family
          moments, every photograph tells a story worth remembering.
        </p>

        <Link
          href="https://www.instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-3 border-b border-[#B89970] pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B89970] transition-colors hover:text-[#F5F0E8]"
        >
          Follow us on Instagram
          <span aria-hidden="true">↗</span>
        </Link>
      </div>

      {/* Moving Instagram Cards */}
      <div className="space-y-7">
        <MovingRow posts={firstRow} direction="left" />
        <MovingRow posts={secondRow} direction="right" />
      </div>

      {/* Bottom Brand Tagline */}
      <div className="mt-16 flex justify-center px-5">
        <div className="rounded-full border border-[#B89970]/40 bg-[#292522] px-7 py-4 text-center shadow-[0_0_25px_rgba(184,153,112,0.08)] sm:px-10">
          <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B89970] sm:text-[10px] sm:tracking-[0.3em]">
            StudioFrame Photography
            <span className="mx-3 text-[#F5F0E8]/50">·</span>
            Every Moment Matters
          </p>
        </div>
      </div>

    </section>
  );
}
