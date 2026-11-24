import Image from "next/image";
import type { ReferenceVideo } from "@/types/film";
import { youtubeThumbnailUrl, youtubeWatchUrl } from "@/lib/youtube";

export function ReferenceVideoCard({
  video,
  watchLabel,
}: {
  video: ReferenceVideo;
  watchLabel: string;
}) {
  const href = youtubeWatchUrl(video.videoId);

  return (
    <article className="premium-card flex h-full flex-col overflow-hidden rounded-2xl">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Play ${video.title} on YouTube (opens in a new tab)`}
        className="group relative block aspect-video overflow-hidden bg-[var(--color-ink)]"
      >
        <Image
          src={youtubeThumbnailUrl(video.videoId)}
          alt={`Thumbnail for ${video.title}`}
          fill
          sizes="(max-width: 768px) 92vw, (max-width: 1024px) 46vw, 30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/35" />
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 inline-flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--studio-champagne-gold)] text-[var(--studio-midnight-black)] shadow-lg transition-transform group-hover:scale-110"
        >
          <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </a>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">
          {video.category}
        </p>
        <h3 className="mt-3 font-serif text-2xl leading-snug text-[var(--color-ink)]">
          {video.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-[var(--color-muted)]">
          {video.description}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--color-line)] pt-5">
          <p className="min-w-0 truncate text-xs text-[var(--color-muted)]">
            {video.channel}
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full bg-[var(--studio-champagne-gold)] px-4 text-sm font-semibold text-[var(--studio-midnight-black)] transition-colors hover:bg-[var(--studio-warm-beige)]"
          >
            {watchLabel} <span aria-hidden="true">↗</span>
            <span className="sr-only"> {video.title} (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </article>
  );
}
