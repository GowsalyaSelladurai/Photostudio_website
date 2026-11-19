import Link from "next/link";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { FeaturedGallery } from "@/components/home/featured-gallery";
import { DroneShowBanner } from "@/components/home/drone-show-banner";
import { FloatingReviews } from "@/components/home/floating-reviews";
import { InstagramPreview } from "@/components/home/instagram-preview";
import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceCard } from "@/components/ui/service-card";
import { galleryImages, services, studioConfig } from "@/config/studio.config";


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

      <DroneShowBanner />

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

      <FloatingReviews />

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
