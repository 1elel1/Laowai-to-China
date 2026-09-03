"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";

/**
 * The locale cookie is read by server components, so switching has to end in a
 * router.refresh() — a client-side state flip would not re-render the tree.
 */
export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next: Locale = locale === "en" ? "zh" : "en";

  function switchTo() {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={switchTo}
      disabled={pending}
      className="btn-ghost btn-sm"
      aria-label={next === "zh" ? "切换到中文" : "Switch to English"}
      title={next === "zh" ? "切换到中文" : "Switch to English"}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
      </svg>
      {/* The globe alone has to carry it on narrow phones. */}
      <span className="hidden sm:inline">{next === "zh" ? "中文" : "EN"}</span>
    </button>
  );
}
