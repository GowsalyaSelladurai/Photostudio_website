import Image from "next/image";
import Link from "next/link";
import { BeforeAfterSlider } from "@/components/gallery/before-after-slider";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { FeaturedGallery } from "@/components/home/featured-gallery";
import { InstagramPreview } from "@/components/home/instagram-preview";
import { OfferBanner } from "@/components/home/offer-banner";
import { ButtonLink } from "@/components/ui/button-link";
import { ReviewCard } from "@/components/ui/review-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceCard } from "@/components/ui/service-card";
import { galleryImages, reviews, services, studioConfig } from "@/config/studio.config";

export default function Home() {
  const content = studioConfig.home;

  return (
    <>
      <HeroCarousel />
      <OfferBanner />

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading
              eyebrow={content.introduction.eyebrow}
              title={content.introduction.title}
              description={content.introduction.description}
            />
            <ButtonLink href="/about" variant="outline" className="mt-7">
              {content.introduction.linkLabel}
            </ButtonLink>
          </div>
          <div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-[var(--color-sand)] sm:min-h-[480px]">
            <Image
              src={content.introduction.image}
              alt={content.introduction.imageAlt}
              fill
              sizes="(max-width: 1024px) 90vw, 55vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-sand)] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <SectionHeading
              eyebrow={content.popularServices.eyebrow}
              title={content.popularServices.title}
            />
            <Link href="/services" className="pb-1 text-sm font-semibold text-[var(--color-clay)] underline-offset-4 hover:underline">
              {content.popularServices.linkLabel} ↗
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 3).map((service) => <ServiceCard key={service.id} service={service} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
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
        <FeaturedGallery images={galleryImages.slice(0, 3)} />
      </section>

      <section className="bg-[var(--color-paper-deep)] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <SectionHeading eyebrow="The finishing touch" title="From the camera to the keepsake." description="See a sample editing comparison, then explore custom frame and album options." />
            <ButtonLink href="/frames" className="mt-7">Explore keepsakes</ButtonLink>
          </div>
          <BeforeAfterSlider />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <SectionHeading
            eyebrow={content.testimonials.eyebrow}
            title={content.testimonials.title}
            description={content.testimonials.description}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
        </div>
      </section>

      <InstagramPreview />

      <section className="bg-[var(--color-ink)] px-5 py-20 text-center text-white sm:px-8 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
          {content.closing.eyebrow}
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
          {content.closing.title}
        </h2>
        <ButtonLink href="/booking" variant="light" className="mt-8">
          {content.closing.linkLabel}
        </ButtonLink>
      </section>
    </>
  );
}
