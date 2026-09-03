import { CITY_BY_SLUG, LANGUAGE_BY_CODE, THEME_BY_SLUG } from "./constants";
import type { Locale } from "./i18n";

/** Money is stored in minor units (cents / 分) to keep floats out of the DB. */
export function formatMoney(cents: number, currency: string, locale: Locale = "en"): string {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDate(date: Date | string, locale: Locale = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatDateRange(start: Date, end: Date, locale: Locale = "en"): string {
  if (start.toDateString() === end.toDateString()) return formatDate(start, locale);
  return `${formatDate(start, locale)} – ${formatDate(end, locale)}`;
}

export function formatDateTime(date: Date, locale: Locale = "en"): string {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function relativeTime(date: Date, locale: Locale = "en"): string {
  const rtf = new Intl.RelativeTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    numeric: "auto",
  });
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(seconds, "second");
}

/** Localised label for a city slug; falls back to the raw slug for unknown cities. */
export function cityLabel(slug: string, locale: Locale = "en"): string {
  const city = CITY_BY_SLUG.get(slug);
  if (!city) return slug;
  return locale === "zh" ? city.zh : city.en;
}

export function languageLabel(code: string, locale: Locale = "en"): string {
  const lang = LANGUAGE_BY_CODE.get(code);
  if (!lang) return code.toUpperCase();
  return locale === "zh" ? lang.zh : lang.en;
}

export function themeLabel(slug: string, locale: Locale = "en"): string {
  const theme = THEME_BY_SLUG.get(slug);
  if (!theme) return slug;
  return locale === "zh" ? theme.zh : theme.en;
}

export function themeEmoji(slug: string): string {
  return THEME_BY_SLUG.get(slug)?.emoji ?? "📍";
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** `2026-09-04` for <input type="date"> without timezone drift. */
export function toDateInputValue(date: Date): string {
  const tzOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}
