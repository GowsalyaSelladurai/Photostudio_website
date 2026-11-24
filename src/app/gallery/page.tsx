"use client";

import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

type GalleryItem = {
  id: number;
  title: string;
  category: string;
  image: string;
};

const image = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

const galleryData: GalleryItem[] = [
  { id: 1, title: "Traditional Indian Wedding", category: "Wedding", image: image("photo-1744804298726-88ee70f07fdc") },
  { id: 2, title: "Indian Engagement Couple", category: "Engagement", image: image("photo-1697684458782-aa963fc73bcc") },
  { id: 3, title: "Traditional Haldi Celebration", category: "Haldi", image: image("photo-1771992223384-96d5914e99f9") },
  { id: 4, title: "Bridal Mehendi", category: "Mehendi", image: image("photo-1613823738441-ac32be690327") },
  { id: 5, title: "South Indian Wedding Reception", category: "Reception", image: image("photo-1630663124437-382b3831e7d8") },
  { id: 7, title: "Motherhood Portrait", category: "Maternity", image: image("photo-1774437891904-3c642f45d05d") },
  { id: 8, title: "Traditional Family Celebration", category: "Baby Shower", image: image("photo-1524069290683-0457abfe42c3") },
  { id: 9, title: "Newborn Photography", category: "Newborn", image: image("photo-1511895426328-dc8714191300") },
  { id: 10, title: "Children Photography", category: "Kids & Birthday", image: image("photo-1503454537195-1dcabb73ffb9") },
  { id: 11, title: "Family Portrait", category: "Family", image: image("photo-1511632765486-a01980e01a18") },
  { id: 12, title: "Tamil Nadu Cultural Celebration", category: "Events", image: image("photo-1688820661462-a44e4b2770e8") },
  { id: 13, title: "Indian Traditional Fashion", category: "Fashion", image: image("photo-1624214390234-2849d6a888c0") },
  { id: 14, title: "Professional Product Photography", category: "Commercial", image: image("photo-1497366754035-f200968a6e72") },
  { id: 15, title: "Ooty Landscape, Tamil Nadu", category: "Nature", image: image("photo-1695909982663-dee924c1d0e0") },
  { id: 16, title: "Kodaikanal Panoramic Landscape", category: "360° Photos", image: image("photo-1745169921154-235bd8c4e6b8") },
  { id: 17, title: "Kodaikanal Waterfall", category: "360° Videos", image: image("photo-1745169921152-ff800cb68f30") },
  { id: 18, title: "Indian Wedding Cinematic", category: "Wedding Cinematics", image: image("photo-1766590864665-7c81f43c3318") },
  { id: 19, title: "Traditional Indian Couple", category: "Couple Films", image: image("photo-1769500810743-5e5dd4fd5848") },
  { id: 20, title: "Pre-Wedding Couple Portrait", category: "Pre-Wedding Films", image: image("photo-1680491026339-ee9176d87111") },
  { id: 21, title: "Aerial Landscape Photography", category: "Drone Films", image: image("photo-1500530855697-b586d89ba3ee") },
  { id: 22, title: "Tamil Nadu Pongal Celebration", category: "Event Highlights", image: image("photo-1739242895622-ed842c09d596") },
  { id: 23, title: "Photography Equipment", category: "Behind the Scenes", image: image("photo-1516035069371-29a1b244cc32") },
  { id: 24, title: "Tamil Nadu Wedding Editing", category: "Before & After", image: image("photo-1583939003579-730e3918a45a") },
  { id: 25, title: "Studio Photography Setup", category: "Studio Reels", image: image("photo-1492691527719-9d1e07e534b4") },
  { id: 26, title: "Professional Photography Techniques", category: "Photography Techniques", image: image("photo-1497366216548-37526070297c") },
  { id: 27, title: "Tamil Nadu Nature and Culture", category: "Travel & Culture", image: image("photo-1470770841072-f978cf4d019e") },
];

const categories = [
  "All",
  "Wedding",
  "Engagement",
  "Haldi",
  "Mehendi",
  "Reception",
  "Portrait",
  "Maternity",
  "Baby Shower",
  "Newborn",
  "Kids & Birthday",
  "Family",
  "Events",
  "Fashion",
  "Commercial",
  "Nature",
  "360° Photos",
  "360° Videos",
  "Wedding Cinematics",
  "Couple Films",
  "Pre-Wedding Films",
  "Drone Films",
  "Event Highlights",
  "Behind the Scenes",
  "Before & After",
  "Studio Reels",
  "Photography Techniques",
  "Travel & Culture",
];

export default function StudioZoneDayThemeGallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const [comparisonPosition, setComparisonPosition] = useState(50);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<number[]>([]);
  const [filmstripPaused, setFilmstripPaused] = useState(false);

  const visibleGalleryItems = useMemo(
    () => galleryData.filter((item) => !failedImages.includes(item.id)),
    [failedImages]
  );

  // UNIQUE IMAGES FOR AUTOMATIC HERO BANNER
  const heroGalleryItems = useMemo(
    () =>
      visibleGalleryItems.filter(
        (item, index, items) =>
          items.findIndex((photo) => photo.image === item.image) === index
      ),
    [visibleGalleryItems]
  );

  const activeHero =
    heroGalleryItems.length > 0
      ? heroGalleryItems[heroIndex % heroGalleryItems.length]
      : null;

  // AUTOMATIC HERO BANNER
  useEffect(() => {
    if (heroGalleryItems.length < 2) return;

    const timer = window.setInterval(() => {
      setHeroIndex(
        (current) => (current + 1) % heroGalleryItems.length
      );
    }, 4000);

    return () => window.clearInterval(timer);
  }, [heroGalleryItems.length]);

  const filteredItems = useMemo(
    () =>
      visibleGalleryItems.filter((item) => {
        const categoryMatch =
          activeCategory === "All" || item.category === activeCategory;

        const searchMatch =
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase());

        return categoryMatch && searchMatch;
      }),
    [activeCategory, searchQuery, visibleGalleryItems]
  );

  const filmstripItems = [...visibleGalleryItems, ...visibleGalleryItems];

  const currentImageIndex = filteredItems.findIndex(
    (item) => item.id === selectedImage
  );

  const selectedItem =
    selectedImage === null
      ? null
      : visibleGalleryItems.find((item) => item.id === selectedImage);

  const markImageFailed = (id: number) => {
    setFailedImages((current) =>
      current.includes(id) ? current : [...current, id]
    );
  };

  const showPreviousHero = () => {
    if (!heroGalleryItems.length) return;

    setHeroIndex((current) =>
      current === 0 ? heroGalleryItems.length - 1 : current - 1
    );
  };

  const showNextHero = () => {
    if (!heroGalleryItems.length) return;

    setHeroIndex(
      (current) => (current + 1) % heroGalleryItems.length
    );
  };

  const showPreviousImage = () => {
    if (!filteredItems.length) return;

    const index =
      currentImageIndex <= 0
        ? filteredItems.length - 1
        : currentImageIndex - 1;

    setSelectedImage(filteredItems[index].id);
  };

  const showNextImage = () => {
    if (!filteredItems.length) return;

    const index =
      currentImageIndex < 0 ||
      currentImageIndex >= filteredItems.length - 1
        ? 0
        : currentImageIndex + 1;

    setSelectedImage(filteredItems[index].id);
  };

  // FULLSCREEN KEYBOARD CONTROLS
  useEffect(() => {
    if (selectedImage === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedImage(null);
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedImage, currentImageIndex, filteredItems]);

  const comparisonImage =
    "https://images.pexels.com/photos/30458553/pexels-photo-30458553.jpeg?auto=compress&cs=tinysrgb&w=1600";

  const updateGlowPosition = (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    event.currentTarget.style.setProperty(
      "--mouse-x",
      `${event.clientX - rect.left}px`
    );

    event.currentTarget.style.setProperty(
      "--mouse-y",
      `${event.clientY - rect.top}px`
    );
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF8F4] text-[#30251F]">

      {/* HERO BANNER */}
      <section className="relative mx-auto mb-12 mt-4 min-h-[340px] w-[calc(100%-2rem)] max-w-7xl overflow-hidden rounded-3xl border border-[#D8B58C]/50 bg-[#171311] shadow-[0_24px_70px_rgba(23,19,17,0.2)] md:mb-12 md:mt-6 md:min-h-[380px] md:w-[calc(100%-4rem)]">

        {activeHero && (
          <>
            {/* BLURRED BACKGROUND FILLS THE ENTIRE BANNER */}
            <img
              src={activeHero.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover object-center blur-2xl opacity-70"
            />

            {/* MAIN HERO IMAGE */}
            <img
              key={activeHero.id}
              src={activeHero.image}
              alt={activeHero.title}
              onError={() => markImageFailed(activeHero.id)}
              className="absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out"
              style={{
                objectPosition: "center 20%",
              }}
            />
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="relative z-10 flex min-h-[340px] flex-col justify-center px-6 py-8 md:min-h-[380px] md:px-20 md:py-10">
          <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#E7C69B]">
            <span className="h-px w-10 bg-[#E7C69B]" />
            StudioFrame Photography
          </div>

          <p className="mb-4 text-sm uppercase tracking-[0.25em] text-white/80">
            Every picture tells a story
          </p>

          <h1 className="text-5xl font-serif leading-tight text-white md:text-7xl">
            Moments.
            <br />
            Memories.
            <br />
            <span className="italic text-[#E7C69B]">Forever.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-white/80 md:text-lg">
            Explore our collection of weddings, celebrations, portraits and
            cinematic memories captured with creativity and passion.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              onClick={() =>
                document.getElementById("gallery")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="rounded-full bg-[#E7C69B] px-8 py-4 text-sm font-semibold text-[#30251F] transition hover:bg-white"
            >
              Explore Gallery
            </button>

            {activeHero && (
              <span className="text-sm text-white/80">
                {activeHero.category} / {activeHero.title}
              </span>
            )}
          </div>
        </div>

        {heroGalleryItems.length > 1 && (
          <>
            <div className="absolute bottom-8 right-6 z-20 flex items-center gap-3 md:right-20">
              <button
                onClick={showPreviousHero}
                aria-label="Previous banner image"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 text-white backdrop-blur transition hover:bg-white hover:text-black"
              >
                <ArrowLeft size={18} />
              </button>

              <button
                onClick={showNextHero}
                aria-label="Next banner image"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 text-white backdrop-blur transition hover:bg-white hover:text-black"
              >
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="absolute bottom-12 left-6 z-20 flex max-w-[60%] flex-wrap gap-2 md:left-20">
              {heroGalleryItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setHeroIndex(index)}
                  aria-label={`Show banner image ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    heroIndex % heroGalleryItems.length === index
                      ? "w-9 bg-[#E7C69B]"
                      : "w-3 bg-white/60 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* BEFORE AND AFTER */}
      <section className="px-5 py-20 md:px-16 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#A47C52]">
              The Art of Editing
            </p>

            <h2 className="font-serif text-4xl text-[#30251F] md:text-5xl">
              Before <span className="italic text-[#B18A61]">&</span> After
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#81766D] md:text-base">
              Drag the slider to compare the original Tamil Nadu wedding
              photograph with its enhanced colour treatment.
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="relative mx-auto aspect-[13/10] w-full overflow-hidden rounded-2xl bg-[#E9E0D5] shadow-2xl">
              <img
                src={comparisonImage}
                alt="Traditional Tamil Nadu wedding in Chennai"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "center center" }}
              />

              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: `inset(0 0 0 ${comparisonPosition}%)`,
                }}
              >
                <img
                  src={comparisonImage}
                  alt="Enhanced Tamil Nadu wedding photograph"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    objectPosition: "center center",
                    filter:
                      "brightness(1.16) contrast(1.14) saturate(1.38) sepia(0.08)",
                  }}
                />
              </div>

              <span className="absolute left-5 top-5 z-20 rounded-full bg-black/60 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white">
                Before
              </span>

              <span className="absolute right-5 top-5 z-20 rounded-full bg-[#D8B58C]/90 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[#30251F]">
                After
              </span>

              <div
                className="pointer-events-none absolute bottom-0 top-0 z-20 w-0.5 bg-white shadow-lg"
                style={{ left: `${comparisonPosition}%` }}
              >
                <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#D8B58C] text-[#30251F] shadow-xl">
                  <ChevronLeft size={16} />
                  <ChevronRight size={16} />
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={comparisonPosition}
                onChange={(event) =>
                  setComparisonPosition(Number(event.target.value))
                }
                aria-label="Compare photographs"
                className="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
              />
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-[#81766D]">
                Drag the slider to compare
              </p>

              <button
                onClick={() => setComparisonPosition(50)}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8C6847] transition hover:text-black"
              >
                <RotateCcw size={14} />
                Reset comparison
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN GALLERY */}
      <section
        id="gallery"
        className="bg-[#F1ECE5] px-5 py-14 md:px-16 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#A47C52]">
                Our Collection
              </p>

              <h2 className="font-serif text-4xl text-[#30251F] md:text-5xl">
                Explore Our Gallery
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#81766D]">
                Discover beautiful moments across our photography and
                celebration collections.
              </p>
            </div>

            <div className="flex w-full items-center gap-3 rounded-full border border-[#D9CFC2] bg-white px-5 py-3 md:max-w-xs">
              <Search size={18} className="shrink-0 text-[#A47C52]" />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search photographs..."
                className="w-full bg-transparent text-sm text-[#30251F] outline-none placeholder:text-[#A49A90]"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="text-[#81766D] hover:text-black"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* CATEGORY FILTERS */}
          <div className="mb-10 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-5 py-2.5 text-xs font-medium transition-all ${
                  activeCategory === category
                    ? "border-[#A47C52] bg-[#A47C52] text-white shadow-md"
                    : "border-[#D9CFC2] bg-white/70 text-[#65584E] hover:border-[#A47C52] hover:text-[#8C6847]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-[#81766D]">
              Showing{" "}
              <span className="font-semibold text-[#30251F]">
                {filteredItems.length}
              </span>{" "}
              photographs
            </p>

            {activeCategory !== "All" && (
              <button
                onClick={() => setActiveCategory("All")}
                className="text-xs font-semibold uppercase tracking-wider text-[#A47C52] hover:text-black"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* MASONRY GALLERY */}
          {filteredItems.length > 0 ? (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedImage(item.id)}
                  onMouseMove={updateGlowPosition}
                  className="gallery-electric-card group mb-4 block w-full break-inside-avoid text-left"
                >
                  <div className="gallery-electric-inner relative overflow-hidden rounded-xl bg-[#E5DACE]">
                    <div className="relative w-full overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        onError={() => markImageFailed(item.id)}
                        className="block h-auto w-full object-cover transition duration-700 group-hover:scale-110"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80 transition group-hover:opacity-100" />

                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E7C69B]">
                          {item.category}
                        </p>

                        <h3 className="font-serif text-xl text-white">
                          {item.title}
                        </h3>

                        <div className="mt-4 flex items-center gap-2 text-xs text-white/80 opacity-0 transition group-hover:opacity-100">
                          <Maximize2 size={14} />
                          View photograph
                        </div>
                      </div>

                      <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                        <Maximize2 size={17} />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#CFC2B4] py-20 text-center">
              <Camera className="mx-auto mb-4 text-[#A47C52]" size={36} />

              <h3 className="font-serif text-2xl text-[#30251F]">
                No photographs found
              </h3>

              <p className="mt-3 text-sm text-[#81766D]">
                Try another search or choose a different category.
              </p>

              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="mt-6 rounded-full bg-[#A47C52] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#805B3D]"
              >
                View all photographs
              </button>
            </div>
          )}
        </div>
      </section>

      {/* AUTOMATIC INFINITE CAMERA FILMSTRIP */}
      <section className="overflow-hidden bg-[#28211D] pt-16 pb-2">
        <div className="mx-auto mb-9 max-w-7xl px-6 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.4em] text-[#D8B58C]">
            Captured Moments
          </p>

          <h2 className="font-serif text-3xl text-white md:text-5xl">
            The Memory <span className="italic text-[#D8B58C]">Roll</span>
          </h2>

          <p className="mt-4 text-sm text-white/55">
            Every category. Every moment. Every memory.
          </p>
        </div>

        {visibleGalleryItems.length > 0 && (
          <div
            onMouseEnter={() => setFilmstripPaused(true)}
            onMouseLeave={() => setFilmstripPaused(false)}
            onTouchStart={() => setFilmstripPaused(true)}
            onTouchEnd={() => setFilmstripPaused(false)}
            onTouchCancel={() => setFilmstripPaused(false)}
            className="camera-filmstrip-viewport overflow-x-auto px-0 pt-8 pb-2"
            style={{
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div
              className="camera-filmstrip-track flex w-max gap-0 border-y-[10px] border-[#171311] bg-[#171311]"
              style={{
                animationPlayState: filmstripPaused ? "paused" : "running",
              }}
            >
              {filmstripItems.map((item, index) => {
                const isDuplicate = index >= visibleGalleryItems.length;

                return (
                  <button
                    key={`${isDuplicate ? "duplicate" : "original"}-${item.id}`}
                    onClick={() => setSelectedImage(item.id)}
                    tabIndex={isDuplicate ? -1 : 0}
                    aria-hidden={isDuplicate}
                    className="camera-strip-item group relative w-[190px] shrink-0 border-x-[5px] border-[#171311] bg-[#171311] text-left transition-all duration-300 hover:-translate-y-2 md:w-[250px]"
                    title={`View ${item.title}`}
                  >
                    <div className="flex h-5 items-center justify-around gap-2 px-2">
                      {Array.from({ length: 6 }).map((_, holeIndex) => (
                        <span
                          key={holeIndex}
                          className="h-2.5 w-3 rounded-[2px] bg-[#D8D0C5]"
                        />
                      ))}
                    </div>

                    <div className="relative mx-1 h-[155px] overflow-hidden bg-[#3B3028] md:h-[190px]">
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        onError={() => markImageFailed(item.id)}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110 group-hover:brightness-110"
                      />

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="truncate text-[9px] font-semibold uppercase tracking-[0.2em] text-[#E7C69B]">
                          {item.category}
                        </p>

                        <p className="mt-1 truncate font-serif text-sm text-white">
                          {item.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex h-5 items-center justify-around gap-2 px-2">
                      {Array.from({ length: 6 }).map((_, holeIndex) => (
                        <span
                          key={holeIndex}
                          className="h-2.5 w-3 rounded-[2px] bg-[#D8D0C5]"
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-2 text-center text-[10px] uppercase tracking-[0.35em] text-[#D8B58C]/60">
          StudioFrame • Photography Memories • 001 — {visibleGalleryItems.length}
        </div>

        <style jsx>{`
          .camera-filmstrip-viewport {
            -ms-overflow-style: none;
            scrollbar-width: none;
            touch-action: pan-x;
          }

          .camera-filmstrip-viewport::-webkit-scrollbar {
            display: none;
          }

          .camera-filmstrip-track {
            width: max-content;
            animation: camera-filmstrip-scroll 65s linear infinite;
            will-change: transform;
          }

          .camera-filmstrip-track:hover {
            animation-play-state: paused;
          }

          .camera-strip-item {
            cursor: pointer;
          }

          @keyframes camera-filmstrip-scroll {
            from {
              transform: translateX(0);
            }

            to {
              transform: translateX(-50%);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .camera-filmstrip-track {
              animation: none;
            }
          }
        `}</style>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#28211D] px-6 py-14 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <Camera className="mx-auto mb-5 text-[#D8B58C]" size={30} />

          <h2 className="font-serif text-3xl">
            Every Moment Deserves to Be Remembered
          </h2>

          <p className="mt-4 text-sm leading-7 text-white/60">
            From traditional South Indian weddings to beautiful personal
            portraits, we capture your memories with care.
          </p>

          <p className="mt-10 text-xs tracking-wider text-white/40">
            © {new Date().getFullYear()} StudioFrame. All rights reserved.
          </p>
        </div>
      </footer>

      <div className="h-12 w-full bg-[#FAF8F4]" />

      {/* FULLSCREEN IMAGE VIEWER */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            aria-label="Close viewer"
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
          >
            <X size={22} />
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation();
              showPreviousImage();
            }}
            aria-label="Previous photograph"
            className="absolute left-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 md:left-8"
          >
            <ChevronLeft size={25} />
          </button>

          <div
            className="flex max-h-full max-w-6xl flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selectedItem.image}
              alt={selectedItem.title}
              className="max-h-[78vh] max-w-full rounded-lg object-contain"
            />

            <div className="mt-5 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#D8B58C]">
                {selectedItem.category}
              </p>

              <h3 className="mt-2 font-serif text-2xl text-white">
                {selectedItem.title}
              </h3>

              <p className="mt-2 text-xs text-white/50">
                {currentImageIndex >= 0 ? currentImageIndex + 1 : 1} /{" "}
                {filteredItems.length}
              </p>
            </div>
          </div>

          <button
            onClick={(event) => {
              event.stopPropagation();
              showNextImage();
            }}
            aria-label="Next photograph"
            className="absolute right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 md:right-8"
          >
            <ChevronRight size={25} />
          </button>
        </div>
      )}
    </main>
  );
}