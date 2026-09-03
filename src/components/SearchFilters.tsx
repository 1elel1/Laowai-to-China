"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { CITIES, GUIDE_TYPES, LANGUAGES, PRICING_MODES, THEMES } from "@/lib/constants";
import type { Dictionary, Locale } from "@/lib/i18n";

export type FilterValues = {
  q: string;
  city: string;
  lang: string;
  themes: string[];
  type: string;
  pricing: string;
  maxDaily: string;
  minRating: string;
  sort: string;
};

const DAILY_CEILINGS = [30_000, 60_000, 100_000, 200_000];

export function SearchFilters({
  values,
  locale,
  t,
  resultCount,
}: {
  values: FilterValues;
  locale: Locale;
  t: Dictionary;
  resultCount: number;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  /** Build a clean query string — empty fields never end up in the URL. */
  function navigate(form: HTMLFormElement) {
    const params = new URLSearchParams();
    for (const [key, raw] of new FormData(form).entries()) {
      const value = String(raw).trim();
      if (value) params.append(key, value);
    }
    const qs = params.toString();
    startTransition(() => router.push(qs ? `/guides?${qs}` : "/guides", { scroll: false }));
  }

  return (
    <form
      // Remount whenever the applied filters change so the uncontrolled inputs
      // (and a form.reset()) can never drift from what the URL actually says.
      key={JSON.stringify(values)}
      ref={formRef}
      // action/method keep the filters usable when JS has not loaded yet.
      action="/guides"
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        navigate(event.currentTarget);
      }}
      onChange={(event) => navigate(event.currentTarget)}
      className="space-y-5"
      aria-busy={pending}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{t.common.filter}</p>
        <button
          type="button"
          className="btn-ghost btn-sm"
          onClick={() => {
            formRef.current?.reset();
            startTransition(() => router.push("/guides", { scroll: false }));
          }}
        >
          {t.common.clear}
        </button>
      </div>

      <Field label={t.common.search}>
        <input
          type="search"
          name="q"
          defaultValue={values.q}
          placeholder={t.search.searchPlaceholder}
          className="field"
          // Typing should not fire a navigation per keystroke.
          onChange={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (formRef.current) navigate(formRef.current);
            }
          }}
        />
      </Field>

      <Field label={t.search.city}>
        <select name="city" defaultValue={values.city} className="field">
          <option value="">{t.home.searchAnyCity}</option>
          {CITIES.map((city) => (
            <option key={city.slug} value={city.slug}>
              {locale === "zh" ? city.zh : city.en}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t.search.language}>
        <select name="lang" defaultValue={values.lang} className="field">
          <option value="">{t.home.searchAnyLanguage}</option>
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {locale === "zh" ? lang.zh : lang.en}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t.search.guideType}>
        <select name="type" defaultValue={values.type} className="field">
          <option value="">—</option>
          {GUIDE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type === "PROFESSIONAL" ? t.guide.typeProfessional : t.guide.typeLocalFriend}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t.search.pricing}>
        <select name="pricing" defaultValue={values.pricing} className="field">
          <option value="">—</option>
          {PRICING_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {mode === "PAID"
                ? t.apply.pricingPaid
                : mode === "FREE"
                  ? t.apply.pricingFree
                  : t.apply.pricingDonation}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t.search.maxDaily}>
        <select name="maxDaily" defaultValue={values.maxDaily} className="field">
          <option value="">{t.search.anyPrice}</option>
          {DAILY_CEILINGS.map((cents) => (
            <option key={cents} value={cents}>
              ≤ ¥{cents / 100} {t.common.perDay}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t.search.minRating}>
        <select name="minRating" defaultValue={values.minRating} className="field">
          <option value="">—</option>
          {[4.5, 4, 3].map((r) => (
            <option key={r} value={r}>
              {r}+ ★
            </option>
          ))}
        </select>
      </Field>

      <fieldset>
        <legend className="label">{t.search.themes}</legend>
        <div className="flex flex-wrap gap-1.5">
          {THEMES.map((theme) => {
            const checked = values.themes.includes(theme.slug);
            return (
              <label
                key={theme.slug}
                className={`chip cursor-pointer ${checked ? "chip-active" : ""}`}
              >
                <input
                  type="checkbox"
                  name="themes"
                  value={theme.slug}
                  defaultChecked={checked}
                  className="sr-only"
                />
                <span aria-hidden>{theme.emoji}</span>
                {locale === "zh" ? theme.zh : theme.en}
              </label>
            );
          })}
        </div>
      </fieldset>

      <Field label={t.search.sort}>
        <select name="sort" defaultValue={values.sort} className="field">
          <option value="">{t.search.sortRecommended}</option>
          <option value="rating">{t.search.sortRatingDesc}</option>
          <option value="price_asc">{t.search.sortPriceAsc}</option>
          <option value="price_desc">{t.search.sortPriceDesc}</option>
          <option value="newest">{t.search.sortNewest}</option>
        </select>
      </Field>

      <button type="submit" className="btn-secondary w-full">
        {t.common.apply} · {resultCount}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
