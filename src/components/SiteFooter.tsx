import Link from "next/link";
import { getT } from "@/lib/i18n-server";
import { CITIES } from "@/lib/constants";
import { Logo } from "./ui";

export async function SiteFooter() {
  const { locale, t } = await getT();
  const topCities = CITIES.slice(0, 8);

  return (
    <footer className="mt-20 border-t" style={{ backgroundColor: "var(--surface)" }}>
      <div className="section grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm" style={{ color: "var(--muted)" }}>
            {t.tagline}
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">{t.home.popularCities}</h2>
          <ul className="grid grid-cols-2 gap-1.5 text-sm" style={{ color: "var(--muted)" }}>
            {topCities.map((city) => (
              <li key={city.slug}>
                <Link href={`/guides?city=${city.slug}`} className="hover:underline">
                  {locale === "zh" ? city.zh : city.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">{t.footer.product}</h2>
          <ul className="space-y-1.5 text-sm" style={{ color: "var(--muted)" }}>
            <li>
              <Link href="/guides" className="hover:underline">
                {t.nav.findGuides}
              </Link>
            </li>
            <li>
              <Link href="/become-a-guide" className="hover:underline">
                {t.nav.becomeGuide}
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="hover:underline">
                {t.nav.howItWorks}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">{t.footer.legal}</h2>
          <ul className="space-y-1.5 text-sm" style={{ color: "var(--muted)" }}>
            {/* Placeholder routes — swap in real policy pages before launch. */}
            <li>
              <Link href="/#safety" className="hover:underline">
                {t.footer.safety}
              </Link>
            </li>
            <li>
              <span>{t.footer.terms}</span>
            </li>
            <li>
              <span>{t.footer.privacy}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div
          className="section flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{ color: "var(--muted)" }}
        >
          <p className="max-w-2xl">{t.footer.disclaimer}</p>
          <p>
            © {new Date().getFullYear()} TravelingMate. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
