import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { fill } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { cityLabel, languageLabel, relativeTime, themeLabel } from "@/lib/format";
import { decideGuideAction, reinstateGuideAction } from "@/actions/admin";
import { Avatar, Badge, EmptyState, GUIDE_STATUS_TONE, SectionHeading } from "@/components/ui";
import type { GuideStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Admin" };

const TABS = ["PENDING", "APPROVED", "REJECTED", "ALL"] as const;
type Tab = (typeof TABS)[number];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireRole("ADMIN", "/admin");
  const { locale, t } = await getT();

  const raw = (await searchParams).tab?.toUpperCase();
  const tab: Tab = (TABS as readonly string[]).includes(raw ?? "") ? (raw as Tab) : "PENDING";

  const guides = await prisma.guideProfile.findMany({
    where: tab === "ALL" ? {} : { status: tab },
    orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
    include: {
      user: { select: { name: true, email: true, avatarUrl: true } },
      languages: true,
      themes: true,
      _count: { select: { bookings: true } },
    },
  });

  const counts = await prisma.guideProfile.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countByStatus = new Map(counts.map((c) => [c.status, c._count._all]));

  const tabLabel: Record<Tab, string> = {
    PENDING: t.admin.tabPending,
    APPROVED: t.admin.tabApproved,
    REJECTED: t.admin.tabRejected,
    ALL: t.admin.allGuides,
  };

  return (
    <div className="section max-w-4xl py-12">
      <SectionHeading title={t.admin.title} subtitle={t.admin.subtitle} />

      <nav className="mb-6 flex flex-wrap gap-2">
        {TABS.map((value) => (
          <Link
            key={value}
            href={`/admin?tab=${value.toLowerCase()}`}
            className={`chip ${tab === value ? "chip-active" : ""}`}
          >
            {tabLabel[value]}
            {value !== "ALL" && (
              <span style={{ color: "var(--muted)" }}>{countByStatus.get(value) ?? 0}</span>
            )}
          </Link>
        ))}
      </nav>

      {guides.length === 0 ? (
        <EmptyState title={t.admin.queueEmpty} />
      ) : (
        <div className="space-y-4">
          {guides.map((guide) => {
            const status = guide.status as GuideStatus;
            return (
              <article key={guide.id} className="card p-5">
                <header className="flex flex-wrap items-start gap-3">
                  <Avatar name={guide.user.name} src={guide.user.avatarUrl} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/guides/${guide.id}`} className="font-semibold hover:underline">
                        {guide.user.name}
                      </Link>
                      <Badge tone={GUIDE_STATUS_TONE[status]}>{t.apply[`status${status}`]}</Badge>
                      <Badge tone={guide.guideType === "PROFESSIONAL" ? "brand" : "accent"}>
                        {guide.guideType === "PROFESSIONAL"
                          ? t.guide.typeProfessional
                          : t.guide.typeLocalFriend}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>
                      {guide.user.email} · {cityLabel(guide.city, locale)}
                      {guide.licenseNo && ` · ${t.guide.licenseNo} ${guide.licenseNo}`}
                    </p>
                    {guide.submittedAt && (
                      <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                        {fill(t.admin.submitted, {
                          time: relativeTime(guide.submittedAt, locale),
                        })}
                      </p>
                    )}
                  </div>
                </header>

                <p className="mt-4 font-medium">{guide.headline}</p>
                <p className="mt-2 line-clamp-4 text-sm" style={{ color: "var(--ink-soft)" }}>
                  {guide.bio}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {guide.languages.map((lang) => (
                    <span key={lang.id} className="chip">
                      {languageLabel(lang.code, locale)}
                    </span>
                  ))}
                  {guide.themes.map((theme) => (
                    <span key={theme.id} className="chip">
                      {themeLabel(theme.slug, locale)}
                    </span>
                  ))}
                </div>

                {guide.reviewNote && (
                  <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
                    {t.apply.reviewNote}: {guide.reviewNote}
                  </p>
                )}

                <footer className="mt-4 border-t pt-4">
                  {status === "APPROVED" ? (
                    <form action={decideGuideAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="guideId" value={guide.id} />
                      <input
                        name="note"
                        placeholder={t.admin.notePlaceholder}
                        className="field flex-1 py-1.5 text-xs"
                      />
                      <button
                        type="submit"
                        name="decision"
                        value="SUSPENDED"
                        className="btn-danger btn-sm"
                      >
                        {t.admin.suspend}
                      </button>
                    </form>
                  ) : status === "SUSPENDED" || status === "REJECTED" ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <form action={reinstateGuideAction}>
                        <input type="hidden" name="guideId" value={guide.id} />
                        <button type="submit" className="btn-primary btn-sm">
                          {t.admin.reinstate}
                        </button>
                      </form>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        {guide._count.bookings} {t.guideDesk.statsRequests}
                      </span>
                    </div>
                  ) : (
                    <form action={decideGuideAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="guideId" value={guide.id} />
                      <input
                        name="note"
                        placeholder={t.admin.notePlaceholder}
                        className="field flex-1 py-1.5 text-xs"
                        aria-label={t.admin.noteLabel}
                      />
                      <button
                        type="submit"
                        name="decision"
                        value="APPROVED"
                        className="btn-primary btn-sm"
                      >
                        {t.admin.approve}
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="REJECTED"
                        className="btn-secondary btn-sm"
                      >
                        {t.admin.reject}
                      </button>
                    </form>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
