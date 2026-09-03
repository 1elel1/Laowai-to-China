import Link from "next/link";
import type { GuideCardData } from "@/lib/guides";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cityLabel, formatMoney, languageLabel, themeEmoji, themeLabel } from "@/lib/format";
import { Avatar, Badge, Stars } from "./ui";

export function GuideCard({ guide, locale }: { guide: GuideCardData; locale: Locale }) {
  const t = getDictionary(locale);
  const cover = guide.photos[0]?.url;

  return (
    <Link
      href={`/guides/${guide.id}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
    >
      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{ backgroundColor: "var(--surface-2)" }}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-3xl opacity-40" aria-hidden>
            {themeEmoji(guide.themes[0]?.slug ?? "")}
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge tone={guide.guideType === "PROFESSIONAL" ? "brand" : "accent"}>
            {guide.guideType === "PROFESSIONAL" ? t.guide.typeProfessional : t.guide.typeLocalFriend}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <Avatar name={guide.user.name} src={guide.user.avatarUrl} size={38} />
          {/* min-w-0 lets the name truncate instead of pushing the rating out. */}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{guide.user.name}</p>
            <p className="truncate text-sm" style={{ color: "var(--muted)" }}>
              {cityLabel(guide.city, locale)}
              {guide.yearsExperience > 0 && ` · ${guide.yearsExperience}y`}
            </p>
          </div>
        </div>

        <p className="line-clamp-2 text-sm" style={{ color: "var(--ink-soft)" }}>
          {guide.headline}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {guide.themes.slice(0, 2).map((theme) => (
            <span key={theme.slug} className="chip">
              <span aria-hidden>{themeEmoji(theme.slug)}</span>
              {themeLabel(theme.slug, locale)}
            </span>
          ))}
          {guide.themes.length > 2 && <span className="chip">+{guide.themes.length - 2}</span>}
        </div>

        <p className="truncate text-xs" style={{ color: "var(--muted)" }}>
          {guide.languages
            .slice(0, 3)
            .map((l) => languageLabel(l.code, locale))
            .join(" · ")}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3">
          <Stars value={guide.ratingAvg} count={guide.ratingCount} size={13} />
          <PriceTag guide={guide} locale={locale} />
        </div>
      </div>
    </Link>
  );
}

export function PriceTag({ guide, locale }: { guide: GuideCardData; locale: Locale }) {
  const t = getDictionary(locale);

  if (guide.pricingMode === "FREE") {
    return (
      <span className="shrink-0 text-sm font-semibold" style={{ color: "var(--ok)" }}>
        {t.guide.freeShort}
      </span>
    );
  }
  if (guide.pricingMode === "DONATION") {
    return (
      <span className="shrink-0 text-sm font-semibold" style={{ color: "var(--accent)" }}>
        {t.guide.donationShort}
      </span>
    );
  }

  const daily = guide.dailyRateCents > 0;
  const cents = daily ? guide.dailyRateCents : guide.hourlyRateCents;
  if (!cents) return null;

  return (
    <span className="shrink-0 whitespace-nowrap text-sm font-semibold">
      {formatMoney(cents, guide.currency, locale)}
      <span className="font-normal" style={{ color: "var(--muted)" }}>
        {daily ? t.common.perDay : t.common.perHour}
      </span>
    </span>
  );
}
