import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import {
  EMPTY_GUIDE_FORM,
  GuideProfileForm,
  type GuideFormInitial,
} from "@/components/GuideProfileForm";
import { Badge, GUIDE_STATUS_TONE } from "@/components/ui";
import type { GuideStatus, GuideType, PricingMode } from "@/lib/constants";

export const metadata: Metadata = { title: "Become a guide" };

export default async function BecomeGuidePage() {
  const { locale, t } = await getT();
  const user = await getCurrentUser();

  if (!user) return <GuidePitch t={t} />;

  const profile = await prisma.guideProfile.findUnique({
    where: { userId: user.id },
    include: { languages: true, themes: true, photos: { orderBy: { sort: "asc" } } },
  });

  const initial: GuideFormInitial = profile
    ? {
        city: profile.city,
        headline: profile.headline,
        bio: profile.bio,
        guideType: profile.guideType as GuideType,
        pricingMode: profile.pricingMode as PricingMode,
        currency: profile.currency,
        // Rates round-trip through the form as plain decimal strings.
        hourlyRate: profile.hourlyRateCents ? String(profile.hourlyRateCents / 100) : "",
        dailyRate: profile.dailyRateCents ? String(profile.dailyRateCents / 100) : "",
        yearsExperience: profile.yearsExperience,
        maxGroupSize: profile.maxGroupSize,
        licenseNo: profile.licenseNo ?? "",
        contactWechat: profile.contactWechat ?? "",
        contactPhone: profile.contactPhone ?? "",
        languages: Object.fromEntries(profile.languages.map((l) => [l.code, l.level])),
        themes: profile.themes.map((th) => th.slug),
        photos: profile.photos.map((p) => p.url).join("\n"),
      }
    : EMPTY_GUIDE_FORM;

  const status = (profile?.status ?? "DRAFT") as GuideStatus;

  return (
    <div className="section max-w-3xl py-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t.apply.title}</h1>
          <p className="mt-1 max-w-xl text-sm" style={{ color: "var(--muted)" }}>
            {t.apply.subtitle}
          </p>
        </div>
        {profile && (
          <div className="flex flex-col items-end gap-2">
            <Badge tone={GUIDE_STATUS_TONE[status]}>{t.apply[`status${status}`]}</Badge>
            {status === "APPROVED" && (
              <Link href={`/guides/${profile.id}`} className="link text-xs">
                {t.guideDesk.viewPublic} →
              </Link>
            )}
          </div>
        )}
      </div>

      {profile?.reviewNote && (
        <div
          className="mb-6 rounded-lg px-4 py-3 text-sm"
          style={{ backgroundColor: "var(--warn-soft)", color: "var(--warn)" }}
        >
          <strong className="font-semibold">{t.apply.reviewNote}: </strong>
          {profile.reviewNote}
        </div>
      )}

      <GuideProfileForm
        initial={initial}
        t={t}
        locale={locale}
        isApproved={status === "APPROVED"}
      />
    </div>
  );
}

function GuidePitch({ t }: { t: Awaited<ReturnType<typeof getT>>["t"] }) {
  const pitches = [
    { title: t.apply.pitch1Title, body: t.apply.pitch1Body, emoji: "🎛️" },
    { title: t.apply.pitch2Title, body: t.apply.pitch2Body, emoji: "🚫" },
    { title: t.apply.pitch3Title, body: t.apply.pitch3Body, emoji: "🧳" },
  ];

  return (
    <div className="section max-w-3xl py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.apply.title}</h1>
      <p className="mt-3 text-lg" style={{ color: "var(--ink-soft)" }}>
        {t.home.guideCtaBody}
      </p>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
        {t.apply.pitchTitle}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {pitches.map((pitch) => (
          <div key={pitch.title} className="card p-5">
            <span className="text-2xl" aria-hidden>
              {pitch.emoji}
            </span>
            <h3 className="mt-3 font-semibold">{pitch.title}</h3>
            <p className="mt-1.5 text-sm" style={{ color: "var(--ink-soft)" }}>
              {pitch.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/signup?role=GUIDE&next=%2Fbecome-a-guide" className="btn-primary">
          {t.auth.signupCta}
        </Link>
        <Link href="/login?next=%2Fbecome-a-guide" className="btn-secondary">
          {t.auth.loginCta}
        </Link>
      </div>
    </div>
  );
}
