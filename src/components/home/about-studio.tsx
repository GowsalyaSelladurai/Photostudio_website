
import Link from "next/link";

const stories = [
  {
    category: "CROSS-CULTURE WEDDING",
    title: "A Beautiful Beginning of Forever",
    location: "Coimbatore, Tamil Nadu",
    image:
      "https://mysticstudios.in/wp-content/uploads/2026/05/coimbatore-mvs-mahal-wedding-photographer-00046-650x650.webp",
  },
  {
    category: "TRADITIONAL TAMIL WEDDING",
    title: "A Celebration of Heritage & Love",
    location: "Pollachi, Tamil Nadu",
    image:
      "https://cdn0.weddingwire.in/article/7632/original/1280/jpg/42367-tamil-marriage-pradakshinaa-conclusion.jpeg",
  },
  {
    category: "PRE-WEDDING PHOTOGRAPHY",
    title: "Romance Beyond Forever",
    location: "Chennai, Tamil Nadu",
    image:
      "https://dhilipstudio.com/images/1770743560_save-the-date-pre-wedding-chennai-dhilip-studio.jpg",
  },
  {
    category: "KONGU WEDDING",
    title: "A Love Story in Every Frame",
    location: "Tiruppur, Tamil Nadu",
    image:
      "https://mir-s3-cdn-cf.behance.net/project_modules/1400/379226187355851.65869952a30cf.jpg",
  },
  {
    category: "MALAYALI WEDDING",
    title: "Together Through Every Moment",
    location: "Kerala, India",
    image:
      "https://cdn0.weddingwire.in/article/6651/original/1920/jpeg/131566-nexes-wedding-company.jpeg",
  },
  {
    category: "TAMIL CHRISTIAN WEDDING",
    title: "A Beautiful Journey of Two Hearts",
    location: "Chennai, Tamil Nadu",
    image:
      "https://images.squarespace-cdn.com/content/v1/6564afb4f0851760cfcdde58/d71e358d-8f83-44e8-b8f9-f25e41f5093d/Raizel-Aswhin-Santhome-Cathedral-Chennai-1438.jpg",
  },
  {
    category: "SEEMANTHAM",
    title: "Celebrating a New Little Life",
    location: "Tamil Nadu, India",
    image:
      "https://i.pinimg.com/736x/c8/47/30/c8473060a0b9638b152b1d8b52caf76c.jpg",
  },
  {
    category: "VALAIKAPPU",
    title: "A Day Filled with Blessings",
    location: "Tamil Nadu, India",
    image:
      "https://static.wixstatic.com/media/ac15ad_a6f4da683ab040e289b5ad84e5b54459~mv2.jpg/v1/fill/w_980%2Ch_653%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_auto/ac15ad_a6f4da683ab040e289b5ad84e5b54459~mv2.jpg",
  },
  {
    category: "MATERNITY PHOTOGRAPHY",
    title: "The Beauty of Motherhood",
    location: "Chennai, Tamil Nadu",
    image: "https://motherhoodvibes.com/images/gal-4.jpg",
  },
  {
    category: "ENGAGEMENT",
    title: "The Beginning of Your Forever",
    location: "India",
    image:
      "https://thebridal.photography/assets/images/engage-card-platinum.webp",
  },
  {
    category: "BIRTHDAY CELEBRATION",
    title: "A Day Made of Happy Moments",
    location: "Chennai, Tamil Nadu",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1000&q=85",
  },
  {
    category: "NAMING CEREMONY",
    title: "A Beautiful Name, A New Beginning",
    location: "Tamil Nadu, India",
    image:
      "https://www.vedic-pooja.com/_next/static/media/naamkaran.30934a65.webp",
  },
  {
    category: "HOUSEWARMING",
    title: "A New Home, A New Chapter",
    location: "Tamil Nadu, India",
    image:
      "https://smart-cms-bkd-static-media.jnm.digital/jagran-hindi/images/2025/11/13/template/image/Griha-Pravesh-i-%281%29-1763012020496.jpg",
  },
  {
    category: "WEDDING ANNIVERSARY",
    title: "Love That Grows with Time",
    location: "India",
    image:
      "https://cdn0.weddingwire.in/article/9972/original/1280/jpg/12799-weddinganniversarygiftforparents-thelightsmiths-past.jpeg",
  },
  {
    category: "CORPORATE EVENTS",
    title: "Moments Worth Celebrating",
    location: "Chennai, Tamil Nadu",
    image:
      "https://www.bringitonline.in/uploads/2/2/4/5/22456530/orporate-event-photoshoot-in-delhi-noida-gurgaon-and-mumbai-capturing-conferences-seminars-product-launches-and-business-events-by-top-corporate-event-photographers-in-delhi-ncr-and-mumbai-15_orig.jpg",
  },
];

export function AboutStudio() {
  return (
    <section
      id="about"
      className="bg-[#F5F0E8] px-5 py-20 text-[#171717] sm:px-8 sm:py-24 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* SECTION INTRO */}
        <div className="mb-12">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-7 bg-[#B89970]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#292522]">
              A Few Favorites
            </p>
          </div>

          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <h2 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Small moments, held close.
              </h2>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-[#292522]/75 sm:text-base sm:leading-8">
                From traditional South Indian weddings to Seemantham,
                Valaikappu, birthdays, and family celebrations, we capture
                the emotions and traditions that make every occasion special.
              </p>
            </div>

            <Link
              href="/gallery"
              className="group inline-flex shrink-0 items-center gap-2 pb-1 text-sm font-semibold text-[#171717] transition-colors hover:text-[#A17C50]"
            >
              View the gallery
              <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </Link>
          </div>
        </div>

        {/* WEDDING AND EVENT CARDS */}
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
          {stories.map((story, index) => (
            <article key={story.category} className="group min-w-0">
              <Link href="/gallery" className="block">
                {/* IMAGE */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#E8DDCE]">
                  <img
                    src={story.image}
                    alt={`${story.category} - ${story.title}`}
                    loading={index < 3 ? "eager" : "lazy"}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>

                {/* CARD TEXT */}
                <div className="flex items-start justify-between gap-3 pt-4">
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg text-[#292522] transition-colors duration-300 group-hover:text-[#A17C50] sm:text-xl">
                      {story.title}
                    </h3>

                    <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#82786D]">
                      {story.category}
                    </p>
                  </div>

                  <span className="mt-1 shrink-0 text-sm text-[#292522] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                    ↗
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* EXPLORE GALLERY */}
        <div className="mt-16 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-4 border border-[#B89970] px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#292522] transition-all duration-300 hover:bg-[#292522] hover:text-[#F5F0E8]"
          >
            Explore All Stories
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
