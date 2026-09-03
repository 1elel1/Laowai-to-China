import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, getDictionary, isLocale, LOCALE_COOKIE } from "./i18n";
import type { Dictionary, Locale } from "./i18n";

/** Reads the locale cookie. Server components and server actions only. */
export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const value = jar.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** The pair almost every page needs: the active locale and its dictionary. */
export async function getT(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
