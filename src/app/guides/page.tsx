import type { Metadata } from "next";
import Link from "next/link";
import { fill, type Dictionary } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { searchGuides } from "@/lib/guides";
import { GuideCard } from "@/components/GuideCard";
import { SearchFilters, type FilterValues } from "@/components/SearchFilters";
import { EmptyState } from "@/components/ui";
import { cityLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Find a guide" };

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function many(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { locale, t } = await getT();

  const values: FilterValues = {
    q: one(params.q),
    city: one(params.city),
    lang: one(params.lang),
    themes: many(params.themes),
    type: one(params.type),
    pricing: one(params.pricing),
    maxDaily: one(params.maxDaily),
    minRating: one(params.minRating),
    sort: one(params.sort),
  };
  const page = Math.max(1, Number(one(params.page)) || 1);

  const { items, total, pageCount } = await searchGuides({
    q: values.q || undefined,
    city: values.city || undefined,
    lang: values.lang || undefined,
    themes: values.themes.length ? values.themes : undefined,
    type: values.type || undefined,
    pricing: values.pricing || undefined,
    maxDaily: Number(values.maxDaily) || undefined,
    minRating: Number(values.minRating) || undefined,
    sort: values.sort || undefined,
    page,
  });

  const heading = values.city
    ? `${cityLabel(values.city, locale)} · ${t.search.title}`
    : t.search.title;

  return (
    <div className="section py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          {fill(t.search.resultsCount, { count: total })}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Two renders rather than one: <details> content cannot be reliably
            force-opened by a media query, and on mobile the filters must start
            collapsed so the results stay above the fold. */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <details className="card p-4 lg:hidden">
            <summary className="cursor-pointer list-none text-sm font-semibold [&::-webkit-details-marker]:hidden">
              {t.common.filter} ▾
            </summary>
            <div className="mt-4">
              <SearchFilters values={values} locale={locale} t={t} resultCount={total} />
            </div>
          </details>
          <div className="card hidden p-4 lg:block">
            <SearchFilters values={values} locale={locale} t={t} resultCount={total} />
          </div>
        </aside>

        <div>
          {items.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((guide) => (
                  <GuideCard key={guide.id} guide={guide} locale={locale} />
                ))}
              </div>
              <Pagination page={page} pageCount={pageCount} params={params} t={t} />
            </>
          ) : (
            <EmptyState
              title={t.search.empty}
              hint={t.search.emptyHint}
              action={
                <Link href="/guides" className="btn-secondary btn-sm">
                  {t.common.clear}
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({
  page,
  pageCount,
  params,
  t,
}: {
  page: number;
  pageCount: number;
  params: SearchParams;
  t: Dictionary;
}) {
  if (pageCount <= 1) return null;

  const href = (target: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === "page" || value === undefined) continue;
      for (const item of Array.isArray(value) ? value : [value]) next.append(key, item);
    }
    next.set("page", String(target));
    return `/guides?${next.toString()}`;
  };

  return (
    <nav className="mt-8 flex items-center justify-center gap-3 text-sm">
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn-secondary btn-sm">
          {t.common.previous}
        </Link>
      ) : (
        <span className="btn-secondary btn-sm opacity-50">{t.common.previous}</span>
      )}
      <span style={{ color: "var(--muted)" }}>
        {t.common.page} {page} {t.common.of} {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={href(page + 1)} className="btn-secondary btn-sm">
          {t.common.next}
        </Link>
      ) : (
        <span className="btn-secondary btn-sm opacity-50">{t.common.next}</span>
      )}
    </nav>
  );
}
