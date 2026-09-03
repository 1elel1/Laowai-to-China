import Link from "next/link";
import { getT } from "@/lib/i18n-server";
import { CITIES, LANGUAGES, THEMES } from "@/lib/constants";
import { cityCounts, featuredGuides } from "@/lib/guides";
import { GuideCard } from "@/components/GuideCard";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const { locale, t } = await getT();
  const [featured, counts, user] = await Promise.all([
    featuredGuides(6),
    cityCounts(),
    getCurrentUser(),
  ]);

  // Only surface cities we can actually deliver on.
  const liveCities = CITIES.filter((c) => (counts.get(c.slug) ?? 0) > 0).slice(0, 10);

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(70% 55% at 15% 0%, var(--brand-soft) 0%, transparent 60%)," +
              "radial-gradient(55% 45% at 90% 10%, var(--accent-soft) 0%, transparent 55%)",
          }}
        />
        <div className="section relative py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
               style={{ backgroundColor: "var(--surface)", color: "var(--ink-soft)" }}>
              🇨🇳 {t.tagline}
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {t.home.heroTitle}
            </h1>
            <p className="mt-4 text-lg" style={{ color: "var(--ink-soft)" }}>
              {t.home.heroSubtitle}
            </p>
          </div>

          {/* Plain GET form — search works with JavaScript disabled. */}
          <form
            action="/guides"
            method="get"
            className="card mt-8 grid max-w-3xl gap-3 p-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <label className="sr-only" htmlFor="hero-city">
              {t.home.searchCity}
            </label>
            <select id="hero-city" name="city" className="field" defaultValue="">
              <option value="">{t.home.searchAnyCity}</option>
              {CITIES.map((city) => (
                <option key={city.slug} value={city.slug}>
                  {locale === "zh" ? city.zh : city.en}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="hero-lang">
              {t.home.searchLanguage}
            </label>
            <select id="hero-lang" name="lang" className="field" defaultValue="">
              <option value="">{t.home.searchAnyLanguage}</option>
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {locale === "zh" ? lang.zh : lang.en}
                </option>
              ))}
            </select>

            <button type="submit" className="btn-primary">
              {t.home.heroCta}
            </button>
          </form>

          {liveCities.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                {t.home.popularCities}
              </span>
              {liveCities.map((city) => (
                <Link key={city.slug} href={`/guides?city=${city.slug}`} className="chip">
                  {locale === "zh" ? city.zh : city.en}
                  <span style={{ color: "var(--muted)" }}>{counts.get(city.slug)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ featured */}
      <section className="section py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{t.home.featuredTitle}</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              {t.home.featuredSubtitle}
            </p>
          </div>
          <Link href="/guides" className="btn-secondary btn-sm">
            {t.home.seeAll}
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((guide) => (
              <GuideCard key={guide.id} guide={guide} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="card px-6 py-14 text-center text-sm" style={{ color: "var(--muted)" }}>
            {t.common.noResults}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------ what for */}
      <section className="border-y" style={{ backgroundColor: "var(--surface)" }}>
        <div className="section py-14">
          <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest"
              style={{ color: "var(--muted)" }}>
            {t.search.themes}
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {THEMES.map((theme) => (
              <Link key={theme.slug} href={`/guides?themes=${theme.slug}`} className="chip">
                <span aria-hidden>{theme.emoji}</span>
                {locale === "zh" ? theme.zh : theme.en}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- how it works */}
      <section id="how-it-works" className="section py-16">
        <h2 className="text-2xl font-semibold tracking-tight">{t.home.howTitle}</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { title: t.home.howStep1Title, body: t.home.howStep1Body },
            { title: t.home.howStep2Title, body: t.home.howStep2Body },
            { title: t.home.howStep3Title, body: t.home.howStep3Body },
          ].map((step, i) => (
            <li key={step.title} className="card p-6">
              <span
                className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold"
                style={{ backgroundColor: "var(--brand-soft)", color: "var(--brand-ink)" }}
              >
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* -------------------------------------------------------- guide types */}
      <section className="section pb-16">
        <h2 className="text-2xl font-semibold tracking-tight">{t.home.typesTitle}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <article className="card p-6">
            <h3 className="font-semibold">🎓 {t.home.typeProTitle}</h3>
            <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
              {t.home.typeProBody}
            </p>
            <Link href="/guides?type=PROFESSIONAL" className="link mt-4 inline-block text-sm">
              {t.home.seeAll} →
            </Link>
          </article>
          <article className="card p-6">
            <h3 className="font-semibold">🧭 {t.home.typeFriendTitle}</h3>
            <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
              {t.home.typeFriendBody}
            </p>
            <Link href="/guides?type=LOCAL_FRIEND" className="link mt-4 inline-block text-sm">
              {t.home.seeAll} →
            </Link>
          </article>
        </div>
      </section>

      {/* -------------------------------------------------------- guide recruit */}
      <section className="section pb-16">
        <div
          className="card flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between"
          style={{ backgroundColor: "var(--brand-soft)", borderColor: "var(--brand)" }}
        >
          <div>
            <h2 className="text-xl font-semibold" style={{ color: "var(--brand-ink)" }}>
              {t.home.guideCtaTitle}
            </h2>
            <p className="mt-1 max-w-xl text-sm" style={{ color: "var(--brand-ink)" }}>
              {t.home.guideCtaBody}
            </p>
          </div>
          <Link href={user ? "/become-a-guide" : "/signup?role=GUIDE"} className="btn-primary shrink-0">
            {t.home.guideCtaButton}
          </Link>
        </div>
      </section>

      {/* -------------------------------------------------------------- safety */}
      <section id="safety" className="section pb-20">
        <div className="card p-6">
          <h2 className="font-semibold">{t.home.trustTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm" style={{ color: "var(--ink-soft)" }}>
            {t.home.trustBody}
          </p>
        </div>
      </section>
    </>
  );
}
