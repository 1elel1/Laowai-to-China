import Link from "next/link";
import { decideBookingAction } from "@/actions/booking";
import { fill, type Dictionary, type Locale } from "@/lib/i18n";
import { cityLabel, formatDateRange, formatMoney, relativeTime } from "@/lib/format";
import { Avatar, Badge, BOOKING_TONE } from "./ui";
import { ReviewForm } from "./ReviewForm";

export type BookingRowData = {
  id: string;
  status: string;
  city: string;
  startDate: Date;
  endDate: Date;
  partySize: number;
  budgetCents: number | null;
  currency: string;
  message: string;
  guideReply: string | null;
  respondedAt: Date | null;
  counterpartName: string;
  counterpartAvatar: string | null;
  counterpartHref?: string;
  conversationId: string | null;
  canReview: boolean;
  reviewed: boolean;
};

export function BookingRow({
  booking,
  perspective,
  t,
  locale,
}: {
  booking: BookingRowData;
  perspective: "TRAVELER" | "GUIDE";
  t: Dictionary;
  locale: Locale;
}) {
  const statusLabel = t.booking[`status${booking.status as "PENDING"}`] ?? booking.status;
  const isGuide = perspective === "GUIDE";

  return (
    <article className="card p-5">
      <header className="flex flex-wrap items-start gap-3">
        <Avatar name={booking.counterpartName} src={booking.counterpartAvatar} size={40} />
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {booking.counterpartHref ? (
              <Link href={booking.counterpartHref} className="hover:underline">
                {booking.counterpartName}
              </Link>
            ) : (
              booking.counterpartName
            )}
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {cityLabel(booking.city, locale)} ·{" "}
            {formatDateRange(booking.startDate, booking.endDate, locale)} · {booking.partySize}p
            {booking.budgetCents
              ? ` · ${formatMoney(booking.budgetCents, booking.currency, locale)}`
              : ""}
          </p>
        </div>
        <Badge tone={BOOKING_TONE[booking.status] ?? "muted"}>{statusLabel}</Badge>
      </header>

      <p className="mt-4 whitespace-pre-line text-sm" style={{ color: "var(--ink-soft)" }}>
        {booking.message}
      </p>

      {booking.guideReply && (
        <div
          className="mt-3 rounded-lg px-3 py-2 text-sm"
          style={{ backgroundColor: "var(--surface-2)", color: "var(--ink-soft)" }}
        >
          <strong className="font-semibold">{t.booking.guideReply}: </strong>
          {booking.guideReply}
        </div>
      )}

      {booking.respondedAt && (
        <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
          {fill(t.booking.respondedAt, { time: relativeTime(booking.respondedAt, locale) })}
        </p>
      )}

      <footer className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
        {booking.conversationId && (
          <Link href={`/messages/${booking.conversationId}`} className="btn-secondary btn-sm">
            {t.dashboard.openConversation}
          </Link>
        )}

        {isGuide && booking.status === "PENDING" && (
          // A reply is optional, so accept/decline post the same form with
          // different `decision` values rather than duplicating the textarea.
          <form action={decideBookingAction} className="flex flex-1 flex-wrap items-center gap-2">
            <input type="hidden" name="bookingId" value={booking.id} />
            <input
              name="reply"
              placeholder={t.booking.replyPlaceholder}
              className="field flex-1 py-1.5 text-xs"
              maxLength={1000}
            />
            <button type="submit" name="decision" value="ACCEPTED" className="btn-primary btn-sm">
              {t.booking.accept}
            </button>
            <button type="submit" name="decision" value="DECLINED" className="btn-secondary btn-sm">
              {t.booking.decline}
            </button>
          </form>
        )}

        {!isGuide && booking.status === "PENDING" && (
          <form action={decideBookingAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <button type="submit" name="decision" value="CANCELLED" className="btn-danger btn-sm">
              {t.booking.cancel}
            </button>
          </form>
        )}

        {booking.status === "ACCEPTED" && (
          <form action={decideBookingAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <button type="submit" name="decision" value="COMPLETED" className="btn-secondary btn-sm">
              {t.booking.markComplete}
            </button>
          </form>
        )}

        {booking.reviewed && (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            ✓ {t.dashboard.reviewed}
          </span>
        )}
      </footer>

      {booking.canReview && <ReviewForm bookingId={booking.id} t={t} />}
    </article>
  );
}
