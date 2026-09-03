import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fill } from "@/lib/i18n";
import { getLocale, getT } from "@/lib/i18n-server";
import {
  cityLabel,
  formatDate,
  formatMoney,
  languageLabel,
  themeEmoji,
  themeLabel,
  toDateInputValue,
} from "@/lib/format";
import { Avatar, Badge, Stars } from "@/components/ui";
import { BookingForm } from "@/components/BookingForm";
import { startConversationAction } from "@/actions/message";

async function loadGuide(id: string) {
  return prisma.guideProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, createdAt: true } },
      languages: true,
      themes: true,
      photos: { orderBy: { sort: "asc" } },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { author: { select: { name: true, avatarUrl: true, country: true } } },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const guide = await loadGuide((await params).id);
  if (!guide) return { title: "Guide" };
  const locale = await getLocale();
  return {
    title: `${guide.user.name} · ${cityLabel(guide.city, locale)}`,
    description: guide.headline,
  };
}

export default async function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { locale, t } = await getT();
  const [guide, viewer] = await Promise.all([loadGuide(id), getCurrentUser()]);

  if (!guide) notFound();

  const isOwner = viewer?.id === guide.user.id;
  const isAdmin = viewer?.role === "ADMIN";
  // Unapproved profiles stay visible to their owner and to admins for review.
  if (guide.status !== "APPROVED" && !isOwner && !isAdmin) notFound();

  // Contact details unlock only once this specific traveller has been accepted.
  const acceptedBooking = viewer
    ? await prisma.bookingRequest.findFirst({
        where: { travelerId: viewer.id, guideId: guide.id, status: { in: ["ACCEPTED", "COMPLETED"] } },
        select: { id: true },
      })
    : null;
  const contactUnlocked = Boolean(acceptedBooking) || isOwner;

  const paid = guide.pricingMode === "PAID";

  return (
    <div className="section py-10">
      {guide.status !== "APPROVED" && (
        <div
          className="mb-6 rounded-lg px-4 py-3 text-sm"
          style={{ backgroundColor: "var(--warn-soft)", color: "var(--warn)" }}
        >
          {t.apply[`status${guide.status as "DRAFT"}`] ?? guide.status}
          {guide.reviewNote && ` — ${guide.reviewNote}`}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* ------------------------------------------------------------ main */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-4">
            <Avatar name={guide.user.name} src={guide.user.avatarUrl} size={72} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {guide.user.name}
                </h1>
                <Badge tone={guide.guideType === "PROFESSIONAL" ? "brand" : "accent"}>
                  {guide.guideType === "PROFESSIONAL"
                    ? t.guide.typeProfessional
                    : t.guide.typeLocalFriend}
                </Badge>
              </div>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                📍 {cityLabel(guide.city, locale)}
                {guide.yearsExperience > 0 &&
                  ` · ${fill(t.guide.experience, { years: guide.yearsExperience })}`}
                {` · ${fill(t.guide.groupSize, { n: guide.maxGroupSize })}`}
              </p>
              <div className="mt-2">
                <Stars
                  value={guide.ratingAvg}
                  count={guide.ratingCount}
                  size={15}
                  label={t.common.reviews}
                />
              </div>
            </div>
          </div>

          <p className="mt-6 text-lg font-medium" style={{ color: "var(--ink)" }}>
            {guide.headline}
          </p>

          {guide.photos.length > 0 && (
            <div className="no-scrollbar mt-6 flex gap-3 overflow-x-auto">
              {guide.photos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.url}
                  alt={photo.caption ?? ""}
                  loading="lazy"
                  className="h-56 w-80 shrink-0 rounded-xl border object-cover"
                />
              ))}
            </div>
          )}

          <section className="mt-8">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              {t.guide.about}
            </h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              {guide.bio.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                {t.guide.speaks}
              </h2>
              <ul className="space-y-1.5 text-sm">
                {guide.languages.map((lang) => (
                  <li key={lang.id} className="flex items-center justify-between gap-3">
                    <span>{languageLabel(lang.code, locale)}</span>
                    <span style={{ color: "var(--muted)" }}>
                      {t.apply[`level${lang.level as "NATIVE"}`] ?? lang.level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                {t.guide.showsYou}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {guide.themes.map((theme) => (
                  <span key={theme.id} className="chip">
                    <span aria-hidden>{themeEmoji(theme.slug)}</span>
                    {themeLabel(theme.slug, locale)}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {guide.guideType === "PROFESSIONAL" && guide.licenseNo && (
            <p className="mt-8 text-xs" style={{ color: "var(--muted)" }}>
              {t.guide.licensed} · {t.guide.licenseNo} {guide.licenseNo}
            </p>
          )}
          <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
            {fill(t.guide.memberSince, { date: formatDate(guide.user.createdAt, locale) })}
          </p>

          {/* --------------------------------------------------------- reviews */}
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold">{t.guide.reviewsTitle}</h2>
            {guide.reviews.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {t.guide.noReviews}
              </p>
            ) : (
              <ul className="space-y-4">
                {guide.reviews.map((review) => (
                  <li key={review.id} className="card p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={review.author.name} src={review.author.avatarUrl} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {review.author.name}
                          {review.author.country && (
                            <span className="font-normal" style={{ color: "var(--muted)" }}>
                              {" "}
                              · {review.author.country}
                            </span>
                          )}
                        </p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>
                          {formatDate(review.createdAt, locale)}
                        </p>
                      </div>
                      <Stars value={review.rating} size={13} />
                    </div>
                    <p className="mt-3 text-sm" style={{ color: "var(--ink-soft)" }}>
                      {review.comment}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ----------------------------------------------------------- aside */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-semibold">{t.guide.rates}</h2>
              {paid ? (
                <p className="text-right">
                  {guide.dailyRateCents > 0 && (
                    <span className="block text-lg font-semibold">
                      {formatMoney(guide.dailyRateCents, guide.currency, locale)}
                      <span className="text-sm font-normal" style={{ color: "var(--muted)" }}>
                        {t.common.perDay}
                      </span>
                    </span>
                  )}
                  {guide.hourlyRateCents > 0 && (
                    <span className="block text-sm" style={{ color: "var(--muted)" }}>
                      {formatMoney(guide.hourlyRateCents, guide.currency, locale)}
                      {t.common.perHour}
                    </span>
                  )}
                </p>
              ) : (
                <span
                  className="text-sm font-semibold"
                  style={{ color: guide.pricingMode === "FREE" ? "var(--ok)" : "var(--accent)" }}
                >
                  {guide.pricingMode === "FREE" ? t.guide.freeLabel : t.guide.donationLabel}
                </span>
              )}
            </div>

            <div className="my-5 border-t" />

            <h3 className="mb-3 font-semibold">{t.guide.requestTitle}</h3>

            {isOwner ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {t.booking.ownProfile}
              </p>
            ) : !viewer ? (
              <Link
                href={`/login?next=${encodeURIComponent(`/guides/${guide.id}`)}`}
                className="btn-primary w-full"
              >
                {t.booking.loginRequired}
              </Link>
            ) : guide.status !== "APPROVED" ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {t.errors.guideNotApproved}
              </p>
            ) : (
              <>
                <BookingForm
                  guideId={guide.id}
                  maxGroupSize={guide.maxGroupSize}
                  currency={guide.currency}
                  t={t}
                  minDate={toDateInputValue(new Date())}
                />
                <form action={startConversationAction} className="mt-3">
                  <input type="hidden" name="guideProfileId" value={guide.id} />
                  <button type="submit" className="btn-secondary w-full">
                    {fill(t.messages.startWith, { name: guide.user.name })}
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="card mt-4 p-5">
            <h2 className="font-semibold">{t.guide.contactUnlocked}</h2>
            {contactUnlocked ? (
              <dl className="mt-3 space-y-2 text-sm">
                {guide.contactWechat && (
                  <div className="flex justify-between gap-3">
                    <dt style={{ color: "var(--muted)" }}>{t.guide.wechat}</dt>
                    <dd className="font-medium">{guide.contactWechat}</dd>
                  </div>
                )}
                {guide.contactPhone && (
                  <div className="flex justify-between gap-3">
                    <dt style={{ color: "var(--muted)" }}>{t.guide.phone}</dt>
                    <dd className="font-medium">{guide.contactPhone}</dd>
                  </div>
                )}
                {!guide.contactWechat && !guide.contactPhone && (
                  <p style={{ color: "var(--muted)" }}>—</p>
                )}
              </dl>
            ) : (
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                🔒 {t.guide.contactLocked}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
