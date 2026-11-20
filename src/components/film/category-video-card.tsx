type CategoryVideoCardProps = {
  src: string;
  poster: string;
  category: string;
  title: string;
  caption: string;
};

/** A playable video card for one film category. */
export function CategoryVideoCard({
  src,
  poster,
  category,
  title,
  caption,
}: CategoryVideoCardProps) {
  return (
    <article className="premium-card flex h-full flex-col overflow-hidden rounded-2xl">
      <video
        controls
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={`${title} video`}
        className="aspect-video w-full bg-[var(--color-ink)] object-contain"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support embedded videos.
      </video>
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">
          {category}
        </p>
        <h3 className="mt-3 font-serif text-2xl leading-snug text-[var(--color-ink)]">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          {caption}
        </p>
      </div>
    </article>
  );
}
