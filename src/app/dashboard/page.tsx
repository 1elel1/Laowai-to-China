import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { BookingRow, type BookingRowData } from "@/components/BookingRow";
import { EmptyState, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "My trips" };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const { locale, t } = await getT();

  const [bookings, conversations] = await Promise.all([
    prisma.bookingRequest.findMany({
      where: { travelerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        guide: {
          select: {
            id: true,
            currency: true,
            user: { select: { name: true, avatarUrl: true } },
          },
        },
        review: { select: { id: true } },
      },
    }),
    // One thread per guide, so map by guide rather than by booking — an older
    // booking should still open the conversation it belongs to.
    prisma.conversation.findMany({
      where: { travelerId: user.id },
      select: { id: true, guideProfileId: true },
    }),
  ]);

  const threadByGuide = new Map(conversations.map((c) => [c.guideProfileId, c.id]));

  const rows: BookingRowData[] = bookings.map((booking) => ({
    id: booking.id,
    status: booking.status,
    city: booking.city,
    startDate: booking.startDate,
    endDate: booking.endDate,
    partySize: booking.partySize,
    budgetCents: booking.budgetCents,
    currency: booking.guide.currency,
    message: booking.message,
    guideReply: booking.guideReply,
    respondedAt: booking.respondedAt,
    counterpartName: booking.guide.user.name,
    counterpartAvatar: booking.guide.user.avatarUrl,
    counterpartHref: `/guides/${booking.guide.id}`,
    conversationId: threadByGuide.get(booking.guide.id) ?? null,
    canReview: booking.status === "COMPLETED" && !booking.review,
    reviewed: Boolean(booking.review),
  }));

  const now = Date.now();
  const upcoming = rows.filter(
    (r) => r.endDate.getTime() >= now && !["DECLINED", "CANCELLED"].includes(r.status)
  );
  const past = rows.filter((r) => !upcoming.includes(r));

  return (
    <div className="section max-w-4xl py-12">
      <SectionHeading
        title={t.dashboard.title}
        subtitle={t.dashboard.subtitle}
        action={
          <Link href="/guides" className="btn-secondary btn-sm">
            {t.nav.findGuides}
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title={t.dashboard.empty}
          action={
            <Link href="/guides" className="btn-primary btn-sm">
              {t.dashboard.emptyCta}
            </Link>
          }
        />
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                {t.dashboard.upcoming}
              </h2>
              <div className="space-y-4">
                {upcoming.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    perspective="TRAVELER"
                    t={t}
                    locale={locale}
                  />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                {t.dashboard.past}
              </h2>
              <div className="space-y-4">
                {past.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    perspective="TRAVELER"
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
