
import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/types/studio";
import { formatPrice } from "@/lib/format";
import { serviceImages } from "@/config/service-images";

export function ServiceCard({ service }: { service: Service }) {
  const image = serviceImages[service.id];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#B89970]/25 bg-[#38302A] text-[#F5F0E8] shadow-[0_8px_30px_rgba(23,23,23,0.10)] transition-all duration-500 ease-out hover:-translate-y-2 hover:border-[#B89970]/80 hover:shadow-[0_18px_45px_rgba(184,153,112,0.20)]">

      <div className="relative h-52 overflow-hidden">
        {image && (
          <Image
            src={image}
            alt={service.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#292522]/90 via-[#292522]/20 to-transparent" />

        <div className="absolute bottom-4 left-5">
          <span className="rounded-full border border-[#E8C99F]/40 bg-[#292522]/70 px-3 py-1 text-xs font-medium tracking-wider text-[#E8C99F] backdrop-blur-sm">
            {service.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex-1">
          <h3 className="font-serif text-2xl font-semibold tracking-wide text-[#F5F0E8]">
            {service.name}
          </h3>

          <p className="mt-3 text-sm leading-7 text-[#E8DDCE]/80">
            {service.description}
          </p>

          {service.inclusions && service.inclusions.length > 0 && (
            <ul className="mt-5 space-y-2">
              {service.inclusions.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-[#F5F0E8]/80"
                >
                  <span className="mt-0.5 text-[#E8C99F]">✦</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-7 border-t border-[#B89970]/25 pt-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#E8DDCE]/60">
            Starting from
          </p>

          <p className="mt-1.5 font-serif text-2xl font-semibold tracking-wide text-[#E8C99F] drop-shadow-[0_1px_8px_rgba(232,201,159,0.25)]">
            {formatPrice(service.startingPrice)}
          </p>

          <Link
            href="/contact"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#B89970]/50 bg-[#292522] px-5 py-3 text-sm font-medium text-[#E8DDCE] transition-all duration-300 hover:border-[#E8C99F] hover:bg-[#B89970] hover:text-[#292522]"
          >
            Enquire Now
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
