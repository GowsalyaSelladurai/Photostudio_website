export default function Loading() {
  return (
    <div role="status" className="mx-auto min-h-[50vh] max-w-7xl animate-pulse px-5 py-16 sm:px-8">
      <span className="sr-only">Loading page…</span>
      <div className="h-4 w-32 rounded bg-[var(--color-sand)]" />
      <div className="mt-5 h-12 max-w-lg rounded bg-[var(--color-sand)]" />
      <div className="mt-4 h-6 max-w-2xl rounded bg-[var(--color-sand)]" />
    </div>
  );
}
