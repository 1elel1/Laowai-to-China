"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="section flex flex-col items-center justify-center gap-4 py-32 text-center">
      <p className="text-5xl" aria-hidden>
        ⚠️
      </p>
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm" style={{ color: "var(--muted)" }}>
        The page could not be rendered. Try again, and if it keeps happening the server logs will
        have the details.
      </p>
      <button type="button" onClick={reset} className="btn-primary btn-sm">
        Try again
      </button>
    </div>
  );
}
