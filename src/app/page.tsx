import Link from "next/link";
import { BeforeAfterSlider } from "@/components/gallery/before-after-slider";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { FeaturedGallery } from "@/components/home/featured-gallery";
import { InstagramPreview } from "@/components/home/instagram-preview";
import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceCard } from "@/components/ui/service-card";
import { ReviewCard } from "@/components/ui/review-card";
import { galleryImages, reviews, services, studioConfig } from "@/config/studio.config";


export default function Home() {
  const content = studioConfig.home;

  return (
    <>
      <HeroCarousel />
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 sm:pb-20 lg:pb-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <SectionHeading
            eyebrow={content.featuredGallery.eyebrow}
            title={content.featuredGallery.title}
            description={content.featuredGallery.description}
          />
          <Link href="/gallery" className="pb-1 text-sm font-semibold text-[var(--color-clay)] underline-offset-4 hover:underline">
            {content.featuredGallery.linkLabel} ↗
          </Link>
        </div>
        <FeaturedGallery
          images={[
            { ...galleryImages[0], image: "/mrge_pic/img1.jpg" },
            { ...galleryImages[1], image: "/mrge_pic/img2.jpg" },
            { ...galleryImages[2], image: "/mrge_pic/img3.jpg" },
          ]}
        />
      </section>

      <section className="bg-[var(--color-paper-deep)] px-5 py-10 sm:px-8 sm:py-12">
        <div className="mx-auto grid max-w-7xl items-center gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="max-w-md">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-clay)]">
              The finishing touch
            </p>
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-[var(--color-ink)] sm:text-4xl">
              From the camera to the keepsake.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
              Compare a sample edit, then explore custom frames and albums.
            </p>
            <ButtonLink href="/frames" className="mt-5 min-h-10 px-5 text-xs">
              Explore keepsakes
            </ButtonLink>
          </div>
          <div className="w-full max-w-[36rem] justify-self-end">
            <BeforeAfterSlider />
          </div>
        </div>
      </section>

      <div className="mt-8 border-t border-[var(--color-line)]">
        <InstagramPreview />
      </div>

      <section className="px-5 py-10 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-clay)]">
              {content.popularServices.eyebrow}
            </p>
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-[var(--color-ink)] sm:text-4xl">
              {content.popularServices.title}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 3).map((service) => (
              <ServiceCard key={service.id} service={service} variant="preview" />
            ))}
          </div>
          <div className="mt-6 text-center">
            <ButtonLink href="/services" variant="outline" className="min-h-11 px-5 text-xs">
              Explore All Services
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="bg-[var(--studio-deep-charcoal)] px-5 py-12 text-[var(--studio-ivory-white)] sm:px-8 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--studio-champagne-gold)]">
              {content.testimonials.eyebrow}
            </p>
            <h2 className="font-serif text-4xl leading-tight tracking-tight text-[var(--studio-ivory-white)] sm:text-5xl">
              Stories from Our Clients
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--studio-ivory-white)]/70">
              Fictional demo feedback shown as placeholder content.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 pt-8 sm:px-8">
        <div className="mx-auto max-w-5xl rounded-[1.25rem] bg-[var(--studio-deep-charcoal)] px-6 py-10 text-center text-[var(--studio-ivory-white)] sm:px-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--studio-champagne-gold)]">
            {content.closing.eyebrow}
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
            {content.closing.title}
          </h2>
          <ButtonLink href="/booking" variant="dark" className="mt-7">
            {content.closing.linkLabel}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
