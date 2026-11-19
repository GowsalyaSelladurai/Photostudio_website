import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[55vh] max-w-3xl flex-col items-start justify-center px-5 py-16 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">404 · Page not found</p>
      <h1 className="mt-3 font-serif text-4xl text-[var(--color-ink)]">This frame is empty.</h1>
      <p className="mt-4 text-sm text-[var(--color-muted)]">The page may have moved, or the link may be incorrect.</p>
      <Link href="/" className="mt-7 inline-flex min-h-12 items-center rounded-full bg-[var(--color-ink)] px-6 text-sm font-semibold text-white hover:bg-[var(--color-clay)]">Back to home</Link>
    </section>
  );
}
