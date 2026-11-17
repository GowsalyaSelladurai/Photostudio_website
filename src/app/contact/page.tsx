import type { Metadata } from "next";
import {
  GoogleMapsPlaceholder,
  StudioContactPanel,
} from "@/components/contact/studio-contact-panel";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { SectionHeading } from "@/components/ui/section-heading";
import { studioConfig } from "@/config/studio.config";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const { contact } = studioConfig;

  return (
    <section className="bg-[var(--color-sand)] px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div className="space-y-6">
          <SectionHeading
            eyebrow={contact.introduction.eyebrow}
            title={contact.introduction.title}
            description={contact.introduction.description}
          />
          <StudioContactPanel />
          <GoogleMapsPlaceholder />
        </div>
        <div>
          <SectionHeading
            eyebrow={contact.enquiry.eyebrow}
            title={contact.enquiry.title}
            description={contact.enquiry.description}
          />
          <EnquiryForm />
        </div>
      </div>
    </section>
  );
}
