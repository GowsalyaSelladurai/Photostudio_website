import type {
  FilmBanner,
  FilmCategory,
  HeroVideo,
  ReferenceVideo,
} from "@/types/film";

const demoImage = (id: string, width = 2000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

/**
 * Film page content (demo). The four category banners play the video files in
 * `public/videos`. The Reference Videos section further down uses third-party
 * YouTube uploads — to change one, replace its `videoId`.
 */
export const filmContent = {
  banners: [
    {
      id: "portrait-session",
      videoSrc: "/videos/portrait.mp4",
      eyebrow: "Portrait sessions",
      title: "Every frame,\nplanned with care.",
      description:
        "A look at how a high-stakes portrait session is prepared, lit, and shot in minutes.",
      poster: "/videos/posters/portrait.jpg",
      posterAlt: "A portrait session frame from the Portrait film",
      tabLabel: "Portrait session",
    },
    {
      id: "wedding-day",
      videoSrc: "/videos/wedding.mp4",
      eyebrow: "Weddings & celebrations",
      title: "A whole day,\nbeautifully kept.",
      description:
        "Follow a wedding day from the first preparations to the last dance, behind the camera.",
      poster: "/videos/posters/wedding.jpg",
      posterAlt: "A wedding ritual frame from the Wedding film",
      tabLabel: "Wedding day",
    },
    {
      id: "cinematic-sequence",
      videoSrc: "/videos/cinematic.mp4",
      eyebrow: "Cinematic storytelling",
      title: "Stories that\nmove and linger.",
      description:
        "See how a short cinematic sequence is built shot by shot, from setting the scene to the final detail.",
      poster: "/videos/posters/cinematic.jpg",
      posterAlt: "A backwater landscape frame from the Cinematic film",
      tabLabel: "Cinematic film",
    },
    {
      id: "studio-lighting",
      videoSrc: "/videos/studio.mp4",
      eyebrow: "In the studio",
      title: "Light, mood,\nand a little magic.",
      description:
        "Watch how a single light and a simple backdrop become a polished studio portrait.",
      poster: "/videos/posters/studio.jpg",
      posterAlt: "A studio set frame from the Studio film",
      tabLabel: "Studio portraits",
    },
  ] satisfies FilmBanner[],
  introduction: {
    eyebrow: "Photography & film",
    title: "Moments deserve more than a single frame.",
    paragraphs: [
      "A photograph holds a moment still. A film lets you hear the laughter, feel the pace of the day, and watch the little gestures that made it yours. At StudioFrame we bring both together, so the people and places you care about are remembered the way they truly felt.",
      "This page is a demonstration of how our photography and filmmaking could be presented. Services, packages, and the studio itself are sample content until approved studio details are available.",
    ],
    image: demoImage("photo-1452587925148-ce544e77e70d", 1400),
    imageAlt: "A camera prepared for a photography and film session",
  },
  pillars: {
    eyebrow: "Why it matters",
    title: "Why capture it professionally?",
    description:
      "Days pass quickly. Thoughtful photography and cinematic video give you something to return to.",
    items: [
      {
        title: "Moments you can’t repeat",
        description:
          "A first look, a toast, a child’s laugh. Professional coverage means you stay in the moment while the details are kept for you.",
      },
      {
        title: "Stories, not just clips",
        description:
          "Cinematic editing shapes footage into a short film with rhythm, sound, and emotion, made to rewatch and share.",
      },
      {
        title: "Quality that lasts",
        description:
          "Considered light, steady motion, and careful finishing keep your photographs and films looking right for years.",
      },
    ],
  },
  approach: {
    eyebrow: "Our creative approach",
    title: "From first conversation to final cut.",
    description:
      "Sample process: every project can be adapted to the approved studio’s real workflow.",
    steps: [
      {
        title: "Listen",
        description:
          "We start by learning what matters to you: the people, the feeling, and the moments you would hate to lose.",
      },
      {
        title: "Plan",
        description:
          "We scout light and locations, agree a rough shape for the day, and prepare so the shoot feels relaxed.",
      },
      {
        title: "Capture",
        description:
          "Photographers and filmmakers work together quietly, staying close to real expressions instead of staged poses.",
      },
      {
        title: "Craft",
        description:
          "Careful colour, sound, and editing turn what we captured into a gallery and a film worth revisiting.",
      },
    ],
  },
  references: {
    eyebrow: "Reference videos",
    title: "Watch, learn, and get inspired.",
    description:
      "A hand-picked set of photoshoot and filmmaking videos from other creators on YouTube. They show the kind of craft and care we aim for. Each card opens the video on YouTube.",
    note: "Reference videos are third-party YouTube content shared for inspiration. They are not StudioFrame productions.",
    watchLabel: "Watch on YouTube",
  },
  closing: {
    eyebrow: "Your story, in motion",
    title: "Let’s plan your photoshoot or film.",
    linkLabel: "Book a session",
    secondaryLabel: "Ask a question",
  },
} as const;

export const referenceVideos: ReferenceVideo[] = [
  {
    id: "celebrity-portrait",
    videoId: "WUTTV8IVXM0",
    title: "Hollywood Celebrity Photoshoot in 5 Minutes",
    category: "Portrait photoshoot",
    channel: "Peter McKinnon",
    description:
      "A full breakdown of the location, lighting, and preparation behind a portrait shot against the clock.",
  },
  {
    id: "wedding-behind-the-scenes",
    videoId: "uMjekmi4U2I",
    title: "Full Wedding Photography Behind the Scenes",
    category: "Wedding photography",
    channel: "Forte Films and Stills",
    description:
      "Walk through a complete wedding day from the photographer’s point of view.",
  },
  {
    id: "cinematic-sequence",
    videoId: "xg05Jza995o",
    title: "How I Film a Cinematic Sequence",
    category: "Cinematic filmmaking",
    channel: "Peter McKinnon",
    description:
      "A behind-the-scenes look at building a sequence with intro shots, detail shots, and a clear story.",
  },
  {
    id: "studio-photography",
    videoId: "MI-svwjOO1Y",
    title: "Studio Photography (Is a Lie)",
    category: "Studio portraits",
    channel: "Peter McKinnon",
    description:
      "How simple lighting and backdrops become dramatic portraits, and how to put clients at ease.",
  },
  {
    id: "product-photography",
    videoId: "brm9psWyPes",
    title: "Product Photography You Can Taste",
    category: "Product photography",
    channel: "Peter McKinnon",
    description:
      "Build a set, shape the light, and add the finishing touch that makes a product photograph feel rich.",
  },
  {
    id: "first-feature-film",
    videoId: "5mEctkOMSk8",
    title: "What Challenges Did Matti Haapoja Face Making His First Film?",
    category: "Filmmaking",
    channel: "Matti Haapoja",
    description:
      "A candid conversation about the creative and emotional side of making a first feature film.",
  },
];

/**
 * Autoplay banner at the very top of the Film page. The video files in
 * `public/videos` play muted, one after the other, each for `intervalMs`, and
 * loop forever. Replace a `src` to change a video.
 */
export const heroBanner = {
  eyebrow: "South Indian weddings",
  title: "We love telling\nyour story.",
  description:
    // "Soulful wedding films, from the first ritual to the last blessing, kept the way it felt.",
    "A wedding film is more than just a visual story—it’s a heartfelt journey that captures the essence of love, emotion, and memories that last a lifetime. At Studio Frame, we bring your story to life with soulful, earthy films that speak to the heart, filled with lively moments and perfectly timed sounds that echo your love.",
  ctaLabel: "Plan your film",
  intervalMs: 5000,
  poster: "/videos/posters/top-banner-1.jpg",
  posterAlt: "Opening frame of the featured wedding film",
  videos: [
    {
      id: "top-banner-1",
      src: "/videos/top-banner-1.mp4",
      poster: "/videos/posters/top-banner-1.jpg",
      title: "Featured film 1",
    },
    {
      id: "top-banner-2",
      src: "/videos/top-banner-2.mp4",
      poster: "/videos/posters/top-banner-2.jpg",
      title: "Featured film 2",
    },
  ] satisfies HeroVideo[],
} as const;

export const categoryContent = {
  eyebrow: "Explore by category",
  title: "Choose a film category.",
  allLabel: "Show all categories",
  allStatus:
    "Showing all four categories. Pick one in the banner above to focus on it.",
  items: [
    {
      bannerId: "portrait-session",
      title: "Portrait sessions",
      description:
        "Portraits work best when the person in front of the camera feels at ease. We plan the light and location so the session feels relaxed, and the frames feel like you.",
      highlights: [
        "Location and wardrobe planning before the shoot",
        "Natural light or simple studio lighting",
        "Gentle direction instead of stiff poses",
      ],
      videoTitle: "Portrait film",
      videoCaption: "Watch the portrait session film.",
    },
    {
      bannerId: "wedding-day",
      title: "Weddings & celebrations",
      description:
        "From muhurtham rituals to the reception dance floor, a wedding day moves fast. Photographers and filmmakers work together quietly so nothing important is missed.",
      highlights: [
        "Coverage of rituals, family moments, and candid details",
        "Highlight film and photo gallery from the same day",
        "A calm team that blends into the celebration",
      ],
      videoTitle: "Wedding film",
      videoCaption: "Watch the wedding film.",
    },
    {
      bannerId: "cinematic-sequence",
      title: "Cinematic storytelling",
      description:
        "A cinematic film is built shot by shot: wide scenes, close details, and a rhythm that carries the feeling. It is made to be rewatched.",
      highlights: [
        "Story-first planning with a clear shot list",
        "Careful colour, sound, and pacing in the edit",
        "Teasers and full films for sharing with family",
      ],
      videoTitle: "Cinematic film",
      videoCaption: "Watch the cinematic film.",
    },
    {
      bannerId: "studio-lighting",
      title: "Studio portraits & products",
      description:
        "A controlled studio lets us shape light exactly. It suits family portraits, fashion, and product photography that needs to look polished.",
      highlights: [
        "Backdrops and lighting set up for your look",
        "Comfortable, unhurried sessions",
        "Clean, consistent results across a full set",
      ],
      videoTitle: "Studio film",
      videoCaption: "Watch the studio film.",
    },
  ] satisfies FilmCategory[],
} as const;
