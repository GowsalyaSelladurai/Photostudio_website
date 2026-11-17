import type { Metadata } from "next";
import { BeforeAfterSlider } from "@/components/gallery/before-after-slider";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <>
      <section className="bg-[var(--color-sand)] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="The portfolio" title="Little pieces of life, beautifully kept." description="Browse demo photographs by story. Every image and caption is sample content." />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <GalleryGrid />
      </section>
      <section className="bg-[var(--color-sand)] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionHeading eyebrow="A little polish" title="The same moment, gently finished." description="Drag the slider to compare the sample before-and-after edit." />
          <BeforeAfterSlider />
        </div>
      </section>
    </>
  );
}
