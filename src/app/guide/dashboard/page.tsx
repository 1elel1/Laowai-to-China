import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { BookingRow, type BookingRowData } from "@/components/BookingRow";
import { Badge, EmptyState, GUIDE_STATUS_TONE, SectionHeading, Stars } from "@/components/ui";
import { cityLabel } from "@/lib/format";
import type { GuideStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Guide desk" };

export default async function GuideDashboardPage() {
  const user = await requireUser("/guide/dashboard");
  const { locale, t } = await getT();

  const profile = await prisma.guideProfile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      city: true,
      headline: true,
      status: true,
      currency: true,
      ratingAvg: true,
      ratingCount: true,
    },
  });

  // Nothing to run a desk for yet — send them to the application form.
  if (!profile) redirect("/become-a-guide");

  const [bookings, conversations] = await Promise.all([
    prisma.bookingRequest.findMany({
      where: { guideId: profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        traveler: { select: { id: true, name: true, avatarUrl: true } },
        review: { select: { id: true } },
      },
    }),
    prisma.conversation.findMany({
      where: { guideProfileId: profile.id },
      select: { id: true, travelerId: true },
    }),
  ]);

  const threadByTraveler = new Map(conversations.map((c) => [c.travelerId, c.id]));

  const rows: BookingRowData[] = bookings.map((booking) => ({
    id: booking.id,
    status: booking.status,
    city: booking.city,
    startDate: booking.startDate,
    endDate: booking.endDate,
    partySize: booking.partySize,
    budgetCents: booking.budgetCents,
    currency: profile.currency,
    message: booking.message,
    guideReply: booking.guideReply,
    respondedAt: booking.respondedAt,
    counterpartName: booking.traveler.name,
    counterpartAvatar: booking.traveler.avatarUrl,
    conversationId: threadByTraveler.get(booking.traveler.id) ?? null,
    canReview: false,
    reviewed: Boolean(booking.review),
  }));

  const pending = rows.filter((r) => r.status === "PENDING");
  const answered = rows.filter((r) => r.status !== "PENDING");
  const status = profile.status as GuideStatus;

  return (
    <div className="section max-w-4xl py-12">
      <SectionHeading title={t.guideDesk.title} subtitle={t.guideDesk.subtitle} />

      <div className="card mb-8 flex flex-wrap items-center gap-5 p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{cityLabel(profile.city, locale)}</h2>
            <Badge tone={GUIDE_STATUS_TONE[status]}>{t.apply[`status${status}`]}</Badge>
          </div>
          <p className="mt-1 line-clamp-1 text-sm" style={{ color: "var(--muted)" }}>
            {profile.headline}
          </p>
        </div>

        <dl className="flex gap-6 text-sm">
          <div>
            <dt style={{ color: "var(--muted)" }}>{t.guideDesk.statsRequests}</dt>
            <dd className="text-lg font-semibold">{rows.length}</dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>{t.guideDesk.statsAccepted}</dt>
            <dd className="text-lg font-semibold">
              {rows.filter((r) => r.status === "ACCEPTED" || r.status === "COMPLETED").length}
            </dd>
          </div>
          <div>
            <dt style={{ color: "var(--muted)" }}>{t.guideDesk.statsRating}</dt>
            <dd className="pt-1">
              <Stars value={profile.ratingAvg} count={profile.ratingCount} size={13} />
            </dd>
          </div>
        </dl>

        <div className="flex gap-2">
          <Link href="/become-a-guide" className="btn-secondary btn-sm">
            {t.guideDesk.editProfile}
          </Link>
          {status === "APPROVED" && (
            <Link href={`/guides/${profile.id}`} className="btn-ghost btn-sm">
              {t.guideDesk.viewPublic}
            </Link>
          )}
        </div>
      </div>

      {status !== "APPROVED" && (
        <div
          className="mb-8 rounded-lg px-4 py-3 text-sm"
          style={{ backgroundColor: "var(--warn-soft)", color: "var(--warn)" }}
        >
          {t.guideDesk.notLive}
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState title={t.guideDesk.empty} />
      ) : (
        <div className="space-y-10">
          {pending.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                {t.guideDesk.pending} ({pending.length})
              </h2>
              <div className="space-y-4">
                {pending.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    perspective="GUIDE"
                    t={t}
                    locale={locale}
                  />
                ))}
              </div>
            </section>
          )}

          {answered.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                {t.guideDesk.answered}
              </h2>
              <div className="space-y-4">
                {answered.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    perspective="GUIDE"
                    t={t}
                    locale={locale}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
