"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Page rendering failed", error);
      return;
    }

    console.error("Page rendering failed", error.digest ?? error.name);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[55vh] max-w-3xl flex-col items-start justify-center px-5 py-16 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">Something went wrong</p>
      <h1 className="mt-3 font-serif text-4xl text-[var(--color-ink)]">We couldn&apos;t load this page.</h1>
      <p className="mt-4 text-sm text-[var(--color-muted)]">Please try again. If the problem continues, come back in a little while.</p>
      <button type="button" onClick={reset} className="mt-7 min-h-12 rounded-full bg-[var(--color-ink)] px-6 text-sm font-semibold text-white hover:bg-[var(--color-clay)]">Try again</button>
    </section>
  );
}
