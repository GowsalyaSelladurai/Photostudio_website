import type { Review } from "@/types/studio";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl bg-white p-7">
      <div aria-label="5 out of 5 stars" className="text-sm tracking-[0.2em] text-[var(--color-clay)]">
        ★★★★★
      </div>
      <blockquote className="mt-5 flex-1 font-serif text-xl leading-8 text-[var(--color-ink)]">
        “{review.quote}”
      </blockquote>
      <figcaption className="mt-6 border-t border-[var(--color-line)] pt-4">
        <p className="text-sm font-semibold text-[var(--color-ink)]">
          {review.author}
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          {review.context} · demo review
        </p>
      </figcaption>
    </figure>
  );
}
